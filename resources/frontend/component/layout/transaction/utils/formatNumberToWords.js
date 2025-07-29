  export const numberToWords = (num) => {
        if (num === 0) return "Zero";

        const ones = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
        ];
        const teens = [
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen",
        ];
        const tens = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety",
        ];
        const thousands = ["", "Thousand", "Million", "Billion"];

        const convertHundreds = (n) => {
            let result = "";

            if (n >= 100) {
                const hundreds = Math.floor(n / 100);
                result += ones[hundreds] + " Hundred";
                n %= 100;
                if (n > 0) result += " ";
            }

            if (n >= 20) {
                result += tens[Math.floor(n / 10)];
                n %= 10;
                if (n > 0) result += "-" + ones[n];
            } else if (n >= 10) {
                result += teens[n - 10];
            } else if (n > 0) {
                result += ones[n];
            }

            return result;
        };

        const convertGroup = (n) => {
            if (n === 0) return "";
            return convertHundreds(n);
        };

        let result = "";
        let groupIndex = 0;

        while (num > 0) {
            const group = num % 1000;
            if (group !== 0) {
                let groupText = convertGroup(group);
                if (groupIndex > 0) {
                    groupText += " " + thousands[groupIndex];
                }
                result = groupText + (result ? " " + result : "");
            }
            num = Math.floor(num / 1000);
            groupIndex++;
        }

        return result;
    };