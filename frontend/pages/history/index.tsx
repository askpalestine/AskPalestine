import styles from "../../styles/QnA.module.css";
import detailedStyles from "../../styles/DetailedQnA.module.css";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import Card from "../../components/Card/Card";
import { useRouter } from "next/router";

export const History = (props) => {

    return (
    <Card className={styles.cardContainer}>
            <Card className={detailedStyles.relatedHistoryCardContainer}>
                <div><p>Coming Soon...</p></div>
            </Card>
    </Card>
    )

};

export const getStaticProps: GetStaticProps = async (context) => {
    return {
        props: {
            title: "History",
        },
    };
};

export default History;
