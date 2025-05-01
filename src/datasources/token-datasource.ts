import { IFindTokenQuery, IToken, ITokenDataSource, ITokenCreationBody } from "../interfaces/token-interface";
import TokenModel from "../models/token-model";

class TokenDataSource implements ITokenDataSource  {

    async create(record: ITokenCreationBody): Promise<IToken>{
        return await TokenModel.create(record);
    }
    
    async fetchOne(querry: IFindTokenQuery): Promise<IToken | null> {
        return await TokenModel.findOne(querry);
    }

    async updateOne(data: Partial<IToken>, query: IFindTokenQuery) : Promise<void>{
        await TokenModel.update(data , query)
    }
}

export default TokenDataSource;