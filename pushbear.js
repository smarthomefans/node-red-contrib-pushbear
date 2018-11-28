module.exports = function(RED) {
    var axios = require('axios');
    var mustache = require("mustache");
    axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    function pushbearNode(config) {
        RED.nodes.createNode(this,config);

        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);
        var node = this;
        if (this.server) {
           
        } else {
            node.error("没有配置正确的pushbear server", msg);
            return
        }

        
        node.on('input', function(msg) {
            let title = config.title || msg.topic || this.server.title;
            let sendkey = this.server.sendkey

            let nodeData = config.content;
            var isTemplatedData = (nodeData||"").indexOf("{{") != -1;

            var data = nodeData || msg.payload;
            if (msg.payload && nodeData && (nodeData !== msg.payload)) {  // revert change below when warning is finally removed
                node.warn(RED._("common.errors.nooverride"));
            }

            if (isTemplatedData) {
                data = mustache.render(nodeData,msg);
            }

            if (!data) {
                node.error(RED._("没有需要推送的数据"),msg);
                return;
            }

            let content = data

            //https://pushbear.ftqq.com/sub?sendkey={sendkey}&text={text}&desp={desp}
              axios({
                method: 'post',
                url: 'https://pushbear.ftqq.com/sub',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                params: {
                    'sendkey': sendkey,
                    'text': title,
                    'desp': content
                }
            })
              .then(function (response) {
                msg['statusCode'] = response.status
                msg['headers'] = response.headers
                msg['payload'] = response.data
                msg['request'] = response.request
                node.send(msg);
              })
              .catch(function (error) {
                msg['statusCode'] = error.response.status
                msg['headers'] = error.response.headers
                msg['payload'] = error.response.data
                msg['request'] = error.response.request
                node.send(msg);
              });
        });

    }
    RED.nodes.registerType("pushbear",pushbearNode);


    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.sendkey = n.sendkey;
        this.title = n.title;
    }
    RED.nodes.registerType("pushbear-server",RemoteServerNode);
    
}