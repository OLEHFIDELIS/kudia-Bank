import Db from "./index";

const DbInitailize = async () => {
    try{
       await Db.authenticate();
    }catch(error){
        console.log("unable to connect to our database ", error)
    }
}

export default  DbInitailize;