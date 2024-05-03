import os
from pyln.client import Plugin, RpcError

plugin = Plugin(autopatch=False)

plugin.add_option(name="clnrest-certs", default=os.getcwd(), description="Path for certificates (for https)", opt_type="string", deprecated=False)
plugin.add_option(name="clnrest-protocol", default="https", description="REST server protocol", opt_type="string", deprecated=False)
plugin.add_option(name="clnrest-host", default="127.0.0.1", description="REST server host", opt_type="string", deprecated=False)
plugin.add_option(name="clnrest-port", default=None, description="REST server port to listen", opt_type="int", deprecated=False)
plugin.add_option(name="clnrest-cors-origins", default="*", description="Cross origin resource sharing origins", opt_type="string", deprecated=False, multi=True)
plugin.add_option(name="clnrest-csp", default="default-src 'self'; font-src 'self'; img-src 'self' data:; frame-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';", description="Content security policy (CSP) for the server", opt_type="string", deprecated=False, multi=False)


def parse_plugin_names(plugins: list) -> list:
    file_paths = [p["name"] for p in plugins]

    plugin_names = []
    for path in file_paths:
        file_name_with_extension = path.split("/")[-1]
        plugin_name = file_name_with_extension.split(
            ".")[0]  # remove file type extension
        plugin_names.append(plugin_name)

    return plugin_names


def route_map():
    """
    Dynamically load REST routes from all plugins that have a `{plugin_name}-route-map` rpc method.
    Assumes `plugin_name` matches the plugin file name.
    """

    loaded_plugins = plugin.rpc.plugin_list()["plugins"]
    plugin_names = parse_plugin_names(loaded_plugins)

    route_map = []
    for plugin_name in plugin_names:
        try:
            routes = plugin.rpc.call(f"{plugin_name}-route-map")
            # TODO: validate routes
            route_map.extend(routes)

            plugin.log(
                f"Loaded: {plugin_name}; routes: {routes}", "debug")
        except RpcError as rpc_err:
            # -32601: rpc method not found
            if rpc_err.error["code"] == -32601:
                continue
            plugin.log(
                f"Error loading routes for {plugin_name}: {rpc_err.error}", "error")
        except Exception as e:
            plugin.log(
                f"Error loading routes for {plugin_name}: {e}", "error")

    return route_map


plugin.route_map = route_map
