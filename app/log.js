const CURRENT_LOG_LEVEL = 3;

function log(moduleName,level, levelInt){
    return function (msg){
        if (levelInt >= CURRENT_LOG_LEVEL) {
            const dt = new Date().toUTCString()
            console.log(`${dt} - ${level} - ${moduleName} - ${msg}`);
        }
    }
}

module.exports = function(moduleName){
    return {
        trace: log(moduleName,'TRACE',1),
        debug: log(moduleName,'DEBUG',2),
        info: log(moduleName,'INFO',3),
        warn: log(moduleName,'WARN',4),
        error: log(moduleName,'ERROR',5)
    }
}