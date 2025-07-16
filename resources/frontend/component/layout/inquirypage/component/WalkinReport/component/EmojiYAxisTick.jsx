const EmojiYAxisTick = (props) => {
    const { x, y, payload, emojis } = props;
    const emojiObj = emojis.find((e) => e.rating === Number(payload.value));
    return (
        <g transform={`translate(${x},${y})`}>
            {/* <text
                x={-8}  
                y={0}
                dy={6}
                textAnchor="end"
                fill="#666"
                fontSize={12}
            >
              
            </text> */}
            {emojiObj && (
                <image
                    href={emojiObj.src}
                    x={8}
                    y={-12}
                    width={18}
                    height={18}
                />
            )}
        </g>
    );
};

export default EmojiYAxisTick;
