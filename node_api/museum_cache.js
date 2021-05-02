/**
 * Key:String    muse_Name
 * Value:Array(Object)    news_info
 */


var Cache = {
    cache:new Map(),
    put:function(obj,table_name){
        let muse_Name = obj.muse_Name;
        delete obj.muse_Name;
        let new_obj = {
            table:table_name,
            query:obj,
        }
        if(this.cache.has(muse_Name)){
            let new_array = this.cache.get(muse_Name);
            new_array.push(new_obj);
            this.cache.set(muse_Name,new_array);
        }
        else{
            this.cache.set(muse_Name,[new_obj]);
        }
        console.log(this.cache);
    },
    get:function(key) {
        return this.cache.get(key);
    }
}



module.exports = Cache