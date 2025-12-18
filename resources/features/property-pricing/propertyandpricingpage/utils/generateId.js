const generateBigIntId = () => {
    return (
        BigInt(Date.now()) * BigInt(1000) +
        BigInt(Math.floor(Math.random() * 1000))
    ).toString();
};

export default generateBigIntId;