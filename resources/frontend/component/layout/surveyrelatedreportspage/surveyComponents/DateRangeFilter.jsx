import React from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

const DateRangeFilter = ({ modalRef, closeModal }) => {
    return (
        <dialog
            ref={modalRef}
            className="rounded-[10px] p-6 w-[400px] bg-white shadow-lg"
        >
            <div className="">
                <form
                    method="dialog"
                    className="pt-3 flex justify-end -mr-3"
                >
                    <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                        ✕
                    </button>
                </form>
            </div>
            <h2 className="text-lg font-semibold mb-4">Select Date Range</h2>

            <Tabs defaultValue="account">
                <TabsList>
                    <TabsTrigger value="account">Quick Select</TabsTrigger>
                    <TabsTrigger value="password">Custom</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    Hello
                </TabsContent>
                <TabsContent value="password">
                    Hello2
                </TabsContent>
            </Tabs>
        </dialog>
    )
}

export default DateRangeFilter