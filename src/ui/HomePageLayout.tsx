import React from "react";
import styles from "../styles/HomePageLayout.module.css";

interface HomePageLayoutProps {
  children: React.ReactNode;
}

const HomePageLayout: React.FC<HomePageLayoutProps> = ({ children }) => {
  return (
    <div className={styles.pageLayout}>
      <div className={styles.middleBox}>{children}</div>
    </div>
  );
};

export default HomePageLayout;