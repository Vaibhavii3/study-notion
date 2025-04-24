import { useSelector } from "react-redux"
import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmout from "./RenderTotalAmount"

export default function Cart() {
    const {total, totalItems} = useSelector((state) => state.auth);

    return (
        <div className="text-white">
            <h1> Your Cart </h1>
            <p> {totalItems} Courses in Cart</p>

            {total > 0 
            ? (
                <div>
                    <RenderCartCourses />
                    <RenderTotalAmout />
                </div>
            ) : (<p> Your Cart is Empty</p>)}
        </div>
    )
}