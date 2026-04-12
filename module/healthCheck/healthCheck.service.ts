import AsyncHandler  from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";


const healthCheckService = AsyncHandler(async(require,res)=>{
    res.status(200).json(new ApiResponse(200, {}, "Server is healthy", true));  
})

export default healthCheckService;