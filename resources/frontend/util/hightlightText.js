import React from "react"; // Required if using React.createElement

const highlightText = (text = "", search = "") => {
    if (!text) return "";
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search})`, "gi");

    return text
        .split(regex)
        .map((part, index) =>
            part.toLowerCase() === search.toLowerCase()
                ? React.createElement(
                      "span",
                      { key: index, className: "font-semibold" },
                      part
                  )
                : part
        );
};

export default highlightText;
