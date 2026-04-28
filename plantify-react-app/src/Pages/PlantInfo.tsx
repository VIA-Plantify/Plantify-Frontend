import styles from "./Stylesheets/PlantInfo.module.css";
import plantImage from '../assets/newplant.placeholder.png';
import {Link} from "react-router-dom";

export function PlantInfo() {
    return (
        <div className={styles["plant-info-container"]}>
            <div className={styles["plant-info-content"]}>

                <div className={styles["left-boxes"]}>
                    <div className={styles.box}>Box 1</div>
                    <div className={styles.box}>Box 2</div>
                </div>

                <div className={styles["center-image"]}>
                    <img
                        className={styles["plant-image"]}
                        src={plantImage}
                        alt="Plant"
                    />
                </div>

                <div className={styles["right-boxes"]}>
                    <div className={styles.box}>Box 3</div>
                    <div className={styles.box}>Box 4</div>
                </div>
                <p><Link className={styles.link} to="/">Back up for now</Link></p>
            </div>
        </div>
    );
}

export default PlantInfo;