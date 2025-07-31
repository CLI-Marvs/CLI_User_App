import emoji1 from "../../../../../../public/Images/emoji1.png";
import emoji2 from "../../../../../../public/Images/emoji2.png";
import emoji3 from "../../../../../../public/Images/emoji3.png";
import emoji4 from "../../../../../../public/Images/emoji4.png";
import emoji5 from "../../../../../../public/Images/emoji5.png";

const emojis = [
    {
        src: emoji1,
        gradient: "bg-[linear-gradient(to_bottom,_#c5ffff,_#ffe895)]",
        rating: 5,
        satifaction_name: "Excellent",
    },
    {
        src: emoji2,
        gradient: "bg-[linear-gradient(to_bottom,_#c5ffff,_#ffe895)]",
        rating: 4,
        satifaction_name: "Good",
    },
    {
        src: emoji3,
        gradient: "bg-[radial-gradient(circle,_#f96c24,__#ffe895)]",
        rating: 3,
        satifaction_name: "Fair",
    },
    {
        src: emoji4,
        gradient: "bg-[radial-gradient(circle,_#f96c24,__#ffe895)]",
        rating: 2,
        satifaction_name: "Poor",
    },
    {
        src: emoji5,
        /* gradient: 'bg-[radial-gradient(circle,_#ff8c8c,_#ffefb8)]', */
        gradient: "bg-[radial-gradient(circle,_#f96c24,_#ffe895)]",
        rating: 1,
        satifaction_name: "Very Poor",
    },
];

export default emojis;
