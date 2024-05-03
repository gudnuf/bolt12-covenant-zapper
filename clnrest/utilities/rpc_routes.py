from pyln.client import RpcError, RpcException
import json5
from flask import request, make_response
from flask_restx import Namespace, Resource
from .shared import call_rpc_method, verify_rune, process_help_response, RuneError
from .rpc_plugin import plugin

methods_list = []
rpcns = Namespace("RPCs")
payload_model = rpcns.model("Payload", {}, None, False)


@rpcns.route("/list-methods")
class ListMethodsResource(Resource):
    @rpcns.response(200, "Success")
    @rpcns.response(500, "Server error")
    def get(self):
        """Get the list of all valid rpc methods, useful for Swagger to get human readable list without calling lightning-cli help"""
        try:
            help_response = call_rpc_method(plugin, "help", [])
            html_content = process_help_response(help_response)
            response = make_response(html_content)
            response.headers["Content-Type"] = "text/html"
            return response

        except Exception as err:
            plugin.log(f"Error: {err}", "info")
            return json5.loads(str(err)), 500


@rpcns.route("/<rpc_method>")
class RpcMethodResource(Resource):
    @rpcns.doc(security=[{"rune": []}])
    @rpcns.doc(params={"rpc_method": (f"Name of the RPC method to be called")})
    @rpcns.expect(payload_model, validate=False)
    @rpcns.response(201, "Success")
    @rpcns.response(500, "Server error")
    def post(self, rpc_method):
        """Call any valid core lightning method (check list-methods response)"""
        try:
            rune = request.headers.get("rune", None)
            rpc_method = request.view_args.get("rpc_method", None)
            rpc_params = request.form.to_dict() if not request.is_json else request.get_json(
            ) if len(request.data) != 0 else {}

            try:
                verify_rune(plugin, rune, rpc_method, rpc_params)
            except RpcError as rpc_err:
                plugin.log(f"RPC Error: {str(rpc_err.error)}", "info")
                return rpc_err.error, 401
            except RuneError as rune_err:
                plugin.log(f"Rune Error: {str(rune_err)}", "info")
                return rune_err.error, 403

            try:
                return call_rpc_method(plugin, rpc_method, rpc_params), 201
            except RpcError as rpc_err:
                plugin.log(f"RPC Error: {str(rpc_err.error)}", "info")
                return (rpc_err.error, 404) if rpc_err.error["code"] == -32601 else (rpc_err.error, 500)

        except Exception as err:
            return f"Unable to parse request: {err}", 500


def resource_class_factory(rpc_cmd, method, overrides=None):
    class DynamicRpcMethodResource(Resource):
        @staticmethod
        def handle_request(rpc_cmd, rpc_params):
            plugin.log(f"RPC Method: {rpc_cmd}", "debug")
            try:
                if overrides:
                    for key, value in overrides.items():
                        if key in rpc_params:
                            rpc_params[value] = rpc_params.pop(key)

                plugin.log(f"CALLING {rpc_cmd} with {rpc_params}", "debug")

                return call_rpc_method(plugin, rpc_cmd, rpc_params), 200
            except RpcError as rpc_err:
                plugin.log(f"RPC Error: {str(rpc_err.error)}", "debug")
                return rpc_err.error, rpc_err.error.get("code", 500)

        def get(self, *args, **kwargs):
            # TODO: can anything else be in kwargs other than the dynamic part of the path is <keyset_id>
            rpc_params = kwargs

            return DynamicRpcMethodResource.handle_request(rpc_cmd, rpc_params)

        def post(self, *args, **kwargs):
            plugin.log(f"FORM: {request.form.to_dict()}", "debug")
            plugin.log(f'JSON: {request.get_json()}', "debug")
            rpc_params = request.form.to_dict() if not request.is_json else request.get_json(
            ) if len(request.data) != 0 else {}

            return DynamicRpcMethodResource.handle_request(rpc_cmd, rpc_params)

    # Set the methods dynamically based on the 'method' variable
    DynamicRpcMethodResource.methods = [method]
    return DynamicRpcMethodResource


def add_dynamic_routes(namespace, route_map):
    for route in route_map:
        plugin.log(f"clnrest: Loading: {route}")
        path = route['path']
        rpc_cmd = route['cmd']
        method = route['method'].upper()  # Ensure HTTP method is uppercase
        overrides = route.get('param_overrides', None)

        # Use the factory function to create a unique Resource class for each route
        ResourceClass = resource_class_factory(rpc_cmd, method, overrides)

        # Register the generated Resource class with the namespace
        namespace.add_resource(ResourceClass, path)
