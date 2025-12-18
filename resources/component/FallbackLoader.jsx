import React from "react";
import CLILoader from "@/assets/images/CLI-Logo-Loading-Screen.gif";

const FallbackLoader = () => (
  <div className="flex justify-center items-center h-screen w-screen">
    <img src={CLILoader} alt="Loading..." className="w-[280px]" />
  </div>
);

export default FallbackLoader;