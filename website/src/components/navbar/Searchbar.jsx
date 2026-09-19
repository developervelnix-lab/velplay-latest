import React from 'react'

function Searchbar() {
    return (
        <>
            {/* Search bar */}
            <div className="order-3 md:order-2 w-full md:w-auto mt-3 md:mt-0 md:flex-1 md:mx-6">
                <div className="relative">
                    <input
                        className="w-full bg-gray-100 dark:bg-white/10 backdrop-blur-sm text-black dark:text-white placeholder:text-gray-300 text-sm border border-brand/20 rounded-full pl-4 pr-28 py-2.5 transition duration-300 ease focus:outline-none focus:border-brand hover:border-brand/40 shadow-md"
                        placeholder="Search Event (At least 3 letters)"
                    />
                    <button
                        className="absolute top-1 right-1 flex items-center rounded-full bg-brand py-1.5 px-4 border border-transparent text-center text-sm text-black font-medium transition-all shadow-sm hover:bg-brandDark focus:ring-2 focus:ring-brand/30"
                        type="button"
                    >
                        <FontAwesomeIcon icon={faSearch} className="mr-2" />
                        Search
                    </button>
                </div>
            </div>

        </>
    )
}

export default Searchbar


