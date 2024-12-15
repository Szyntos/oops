import { ReactElement, useState } from "react";

type HooverWrapperProps = {
  children: ReactElement;
};

export const HooverWrapper = ({ children }: HooverWrapperProps) => {
  const [isHoovered, setIsHoovered] = useState(false);

  return (
    <div
      style={{ opacity: isHoovered ? 0.9 : 1 }}
      onMouseEnter={() => setIsHoovered(true)}
      onMouseLeave={() => setIsHoovered(false)}
    >
      {children}
    </div>
  );
};
