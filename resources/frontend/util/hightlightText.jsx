const highlightText = (text, search) => {
    if (!text) return text;
    if (!search) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));

    return (
        <span>
            {parts.map((part, index) =>
                part.toLowerCase() === search.toLowerCase() ? (
                    <span key={index} className="font-semibold">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export default highlightText;
