import { useStateContext } from "@/context/contextprovider";

export const usePropertyFormatter = () => {
    const { propertyNamesList } = useStateContext();

    const formatFunc = (name) => {
        return name
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formattedPropertyNames = [
        "N/A",
        ...(Array.isArray(propertyNamesList) && propertyNamesList.length > 0
            ? propertyNamesList
                  .filter((item) => !item.toLowerCase().includes("phase"))
                  .map((item) => {
                      let formattedItem = formatFunc(item);
                      formattedItem = formattedItem
                          .split(" ")
                          .map((word) => {
                              if (/^(Sjmv|Lpu|Cdo|Dgt)$/i.test(word)) {
                                  return word.toUpperCase();
                              }
                              return (
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              );
                          })
                          .join(" ");

                      if (formattedItem === "Casamira South") {
                          formattedItem = "Casa Mira South";
                      }
                      return formattedItem;
                  })
                  .sort((a, b) => {
                      if (a === "N/A") return -1;
                      if (b === "N/A") return 1;
                      return a.localeCompare(b);
                  })
            : []),
    ];

    return {
        formattedPropertyNames,
    };
};
