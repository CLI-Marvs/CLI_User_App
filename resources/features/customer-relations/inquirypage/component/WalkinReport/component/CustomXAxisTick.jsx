const CustomXAxisTick = ({ x, y, payload }) => {
    const words = payload.value.split(' ');
    const lines = [];
    let line = '';

    words.forEach((word) => {
        if ((line + word).length > 10) {
            lines.push(line.trim());
            line = word + ' ';
        } else {
            line += word + ' ';
        }
    });
    lines.push(line.trim());

    return (
        <g transform={`translate(${x}, ${y + 10})`}>
            <text textAnchor="middle" fontSize={12} fill="#333">
                {lines.map((line, index) => (
                    <tspan key={index} x={0} dy={index === 0 ? 0 : 14}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
};

export default CustomXAxisTick;