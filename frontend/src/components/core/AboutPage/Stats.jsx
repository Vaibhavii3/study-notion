import React from 'react'

const Stats = [
    {count: "5K", label: "Active Students"},
    {count: "10+", label: "Mentors"}, 
    {count: "200+", label: "Course"}, 
    {count: "50+", label: "Awards"}, 
];

const StatesComponent = () => {
    return (
        <section>
            <div>
                <div className='flex gap-x-5'>
                    {
                        Stats.map((data, index) => {
                            return (
                                <div>
                                    <h1> {data.count}</h1>
                                    <h1> {data.label}</h1>
                                </div>    
                            )
                        })
                    }
                </div>
            </div>
        </section>
    )
}

export default StatesComponent