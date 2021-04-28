/**
 * Key:String    muse_Name
 * Value:Array(Object)    news_info
 */


var Cache = {
    cache:new Map(),
    put:function(obj){
        let muse_Name = obj.muse_Name;
        delete obj.muse_Name;
        if(this.cache.has(obj.muse_Name)){
            let new_array = this.cache.get(obj.muse_Name);
            new_array.push(obj);
            this.cache.set(muse_Name,new_array);
        }
        else{
            this.cache.set(muse_Name,[obj]);
        }
        console.log(this.cache);
    },
    get:function(key) {
        return this.cache.get(key);
    }
}



module.exports = Cache