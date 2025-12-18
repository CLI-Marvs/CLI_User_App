import { useLocation } from "react-router-dom";

const useRouteSections = () => {
  const { pathname } = useLocation();

  const segments = pathname.split("/").filter(Boolean);

  const subSection = segments[2] || null;

  return { subSection, segments };
};

export default useRouteSections;
