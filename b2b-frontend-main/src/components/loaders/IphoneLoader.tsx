import styles from "./styles/IphoneLoaderStyles.module.css";

type Props = {
  additionalClassNames?: string;
  barsWhite?: boolean;
};

export default function IphoneLoader({
  additionalClassNames,
  barsWhite,
}: Props) {
  return (
    <div
      className={`${styles["loader"]} ${additionalClassNames || ""} ${
        barsWhite ? styles["bars-white"] : ""
      }`}
    >
      <div className={styles["bar1"]}></div>
      <div className={styles["bar2"]}></div>
      <div className={styles["bar3"]}></div>
      <div className={styles["bar4"]}></div>
      <div className={styles["bar5"]}></div>
      <div className={styles["bar6"]}></div>
      <div className={styles["bar7"]}></div>
      <div className={styles["bar8"]}></div>
      <div className={styles["bar9"]}></div>
      <div className={styles["bar10"]}></div>
      <div className={styles["bar11"]}></div>
      <div className={styles["bar12"]}></div>
    </div>
  );
}
