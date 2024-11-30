import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useRef, useState } from "react";
import Card from "../../../components/Card/Card";
import detailedStyles from "../../../styles/DetailedQnA.module.css";
import { fetchData } from "../../../utils/dataRequests";
import ActionButton from "../../../components/ActionButton/ActionButton";
import { useRouter } from "next/router";
import { Question, Answer } from "../../../interfaces/qa.interface";
import Loading from "../../../components/Loading/Loading";
import { HeartFilledIcon, HeartOutlinedIcon, PlaneIcon } from "../../../assets/svgs";
import IconButton from "@/components/IconButton/IconButton";
import { ToastContainer, toast } from 'react-toastify';
import useAuthStatus from "@/hooks/useAuthStatus";
import styles from "./userProfile.module.css";
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import DOMPurify from 'dompurify';
import Link from "next/link";

export const ShowUserProfile = (props) => {
  const userAnswerRef = useRef<HTMLInputElement>()
  const router = useRouter()
  const [isImageLoaded, setImageLoaded] = useState(false);
  const [profileUsername, setProfileUsername] = useState<string>('Retrieving...')
  const [bio, setBio] = useState<string>('Retrieving...')
  const [QnA, setQnA] = useState<Question>();
  const [currentAnswerId, setCurrentAnswerId] = useState<number>();
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const { authToken, isAuthenticated, username, handleLogin, handleLogout } = useAuthStatus();
  const [bioMarkdownPreview, setBioMarkdownPreview] = useState('Retrieving...');
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);

  const getUser = async () => {
    try {
      let user = await fetchData(`${baseUrl}/users/${router.query.username}/`, authToken);
      setProfileUsername(user.username);
      const processedContent = await remark()
        .use(remarkHtml)
        .process(user.bio);
      const sanitizedHtml = DOMPurify.sanitize(processedContent.toString());
      setBioMarkdownPreview(sanitizedHtml)
    } catch (error) {
      toast.error("Error while fetching user")
    }
  };

  const fetchAnsweredQuestions = async () => {
    try {
      const response = await fetch(`${baseUrl}/questions/user/${router.query.username}/`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch answered questions');
      }
      const data = await response.json();
      setAnsweredQuestions(data);
    } catch (error) {
      console.error('Error fetching answered questions:', error);
    }
  };

  useEffect(() => {
    getUser();
    fetchAnsweredQuestions();
  }, []);

  return (
    <div>
      <ToastContainer />
      <Card className={styles.userProfileContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 'auto' }}>
          {!isImageLoaded && <p>Loading image...</p>}
          {<img src={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/users/photo/${profileUsername}`}
            onLoad={() => setImageLoaded(true)}
            alt="Profile Photo" style={{ borderRadius: '50%', width: '10vh', height: '10vh', objectFit: 'cover', marginBottom: '2vh', }} />}

          <p className={styles.userProfileButtonDescriptions} style={{ whiteSpace: 'pre-wrap', textAlign: 'left', alignSelf: 'flex-start', fontSize: '1.5em' }}><b>{router.query.username}</b></p>
          <br></br>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'left !important' }}>
            <div
              style={{ flex: 1, padding: '1vh' }}
              className={detailedStyles.markdownLink}
              dangerouslySetInnerHTML={{ __html: bioMarkdownPreview }}
            />
          </div>

          <div>
            <h3 style={{ color: 'black', paddingBottom: '20px' }}>Answered Questions</h3>
            {answeredQuestions.length > 0 ? (
              <ul>
                {answeredQuestions.map((question, index) => (
                  <Link key={index} href={`/qa/${question.id}`}>
                    <Card className={styles.answerInProfileContainer}>
                      {question["question_forms"].length > 1 && (
                        <div style={{ paddingBottom: '8px', color: '#006233' }}>
                          <b>Related Questions:</b>
                        </div>
                      )}
                      {question["question_forms"].map((form, index) => (
                        <li key={index} style={{ color: 'black', paddingBottom: index != question["question_forms"].length - 1 ? '16px' : '0px' }}>
                          <span style={{ whiteSpace: "pre-wrap", color: 'blue' }}>{ question["question_forms"].length > 1 ? "Q: " + form : form}</span>
                        </li>
                    ))}
                    </Card>
                  </Link>
                ))}
              </ul>
            ) : (
              <p>No questions answered by this user.</p>
            )}
          </div>



          {username == profileUsername && <ActionButton
            className={styles.userProfileButton}
            onClick={() => handleLogout()}> Logout </ActionButton>
          }

        </div>
      </Card>
    </div >
  );

};


export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      title: "Expert",
    },
  };
};

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {

  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default ShowUserProfile;
