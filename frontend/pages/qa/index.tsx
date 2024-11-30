import styles from "../../styles/QnA.module.css";
import { GetStaticProps } from "next";
import { useEffect, useRef, useState } from 'react'
import Card from "../../components/Card/Card";
import Grid from "../../components/Grid/Grid";
import { fetchData } from "../../utils/dataRequests";
import Search from "../../components/Search/Search";
import ActionButton from "../../components/ActionButton/ActionButton";
import actionButtonStyles from '@/components/ActionButton/ActionButton.module.css';
import Link from "next/link";
import { Question } from "../../interfaces/qa.interface";
import TextField from "@/components/TextField/TextField";
import detailedStyles from "../../styles/DetailedQnA.module.css";
import IconButton from "@/components/IconButton/IconButton";
import { PlaneIcon } from "../../assets/svgs";
import * as React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import useAuthStatus from "@/hooks/useAuthStatus";
import Head from "next/head";
import Loading from "@/components/Loading/Loading";
import { IoFilterSharp } from "react-icons/io5";
import { motion } from "framer-motion";

import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'next-share';

export const QnA = (props) => {
  const router = useRouter();

  const searchRef = useRef<HTMLInputElement>()
  const [QnAs, setQnAs] = useState<Question[]>()
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false)
  const [isProPalestinian, setIsProPalestinian] = useState<boolean>(false)
  const [isProPalestinianExpert, setIsProPalestinianExpert] = useState<boolean>(false)
  const userQuestionRef = useRef<HTMLInputElement>()
  const [userQuestion, setUserQuestion] = useState<string>("")
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL
  const { authToken } = useAuthStatus();
  const [brokenImages, setBrokenImages] = useState(new Set<string>());
  const [tagMap, setTagMap] = useState(new Map());
  const [isGettingQuestions, setIsGettingQuestions] = useState<boolean>(false)
  const [showAnswered, setShowAnswered] = useState<boolean>(true)
  const [isFiltering, setIsFiltering] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>("")
  const handleImageError = (username) => {
    setBrokenImages((prevBrokenImages) => new Set([...prevBrokenImages, username]));
  };
  const [selectedTag, setSelectedTag] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const searching = () => {
    return searchRef && searchRef.current && searchRef.current.value && searchRef.current.value.length > 0
  }

  const fetchTagsWithQuestions = async () => {
    try {
      const tags = await fetchData(`${baseUrl}/questions/tags/`, authToken);

      const newTagMap = new Map();
      tags.forEach(tag => {
        newTagMap.set(tag.name, new Set(tag.question_ids));
      });
      setTagMap(newTagMap);

    } catch (error) {
      console.error("Error during fetching tags with questions:", error);
    }
  }

  const getQuestions = async () => {
    if (!searching()) {
      setIsGettingQuestions(true)
    }

    let queryParamsList = [];

    if (searching()) {
      queryParamsList.push(`filter_text=${searchRef.current.value}`);
    }

    const queryParams = queryParamsList.join('&');

    try {
      const questions = await fetchData(`${baseUrl}/questions/?${queryParams}`, authToken);
      questions.sort((a, b) => {
        let aHasAnswer = a.answers && a.answers.length > 0
        let bHasAnswer = b.answers && b.answers.length > 0
        if (!aHasAnswer && !bHasAnswer) {
          return b.views_count - a.views_count;
        }
        if (!aHasAnswer) {
          return 1;
        }
        if (!bHasAnswer) {
          return -1;
        }
        return b.views_count - a.views_count;
      });
      setQnAs(questions);
    } catch (error) {
      console.error('Error during retrieving questions:', error);
      setIsGettingQuestions(false)
    }
    setIsGettingQuestions(false)
  };

  const searchQuestions = async () => {
    if (!searching()) {
      setIsGettingQuestions(true)
    }

    try {
      const questions = await fetchData(`${baseUrl}/questions/search/?search_text=${searchText}`, authToken);
      setQnAs(questions);
    } catch (error) {
      console.error('Error during retrieving questions:', error);
      setIsGettingQuestions(false)
    }
    setIsGettingQuestions(false)
  };

  const searchError = () => {
    let searchTextWordCount = searchText.trim().split(" ").length
    if (searchTextWordCount < 3) {
      return "The question should be at least 3 words long"
    }
    if (searchTextWordCount > 20) {
      return "The question should be at most 20 words long"
    }
    if (searchText.length > 200) {
      return "The question should be at most 200 characters long"
    }
    return ""
  }
  const searchButtonText = () => {
    if (searchError() != "") {
      return searchError()
    }
    return "Search"
  }

  const submitQuestion = async () => {
    try {

      let text = userQuestionRef.current.value
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/questions/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        })
      });

      userQuestionRef.current.value = ""
      setUserQuestion("")
      if (response.ok) {
        toast.success("Your question has been submitted successfully! An admin will review it soon.",
          {
            autoClose: 4000,
            hideProgressBar: true,
            draggable: false,
            closeOnClick: true,
          });
        setIsAddingQuestion(false)
      } else {
        const data = await response.json();
        toast.error(data["detail"], {
          autoClose: 4000,
          hideProgressBar: true,
          draggable: false,
          closeOnClick: true,
        });
      }
    } catch {
      toast.error("Error submitting question", {
        autoClose: 4000,
        hideProgressBar: true,
        draggable: false,
        closeOnClick: true,
      });
    }
  }
  useEffect(() => {
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
    setIsIos(Boolean(userAgent.match(/iPhone|iPad|iPod/i)));
    setIsAndroid(Boolean(userAgent.match(/Android/i)));
    fetchTagsWithQuestions();
    getQuestions()
  }, [])

  const eyeIcon = <svg fill="#000000" height="3vh" width="3vh" version="1.1" id="Capa_1"
    viewBox="0 0 80.794 80.794">
    <g>
      <g>
        <path d="M79.351,38.549c-0.706-0.903-17.529-22.119-38.953-22.119c-21.426,0-38.249,21.216-38.955,22.119L0,40.396l1.443,1.847
        c0.706,0.903,17.529,22.12,38.955,22.12c21.424,0,38.247-21.217,38.953-22.12l1.443-1.847L79.351,38.549z M40.398,58.364
        c-15.068,0-28.22-13.046-32.643-17.967c4.425-4.922,17.576-17.966,32.643-17.966c15.066,0,28.218,13.045,32.642,17.966
        C68.614,45.319,55.463,58.364,40.398,58.364z"/>
        <path d="M40.397,23.983c-9.052,0-16.416,7.363-16.416,16.414c0,9.053,7.364,16.417,16.416,16.417s16.416-7.364,16.416-16.417
        C56.813,31.346,49.449,23.983,40.397,23.983z M40.397,50.813c-5.744,0-10.416-4.673-10.416-10.417
        c0-5.742,4.672-10.414,10.416-10.414c5.743,0,10.416,4.672,10.416,10.414C50.813,46.14,46.14,50.813,40.397,50.813z"/>
      </g>
    </g>
  </svg>

  // Returns the highly liked answer and favours expert answers
  const getSortedAnswers = (question) => {
    let answers = question.answers
    let sortedAnswers = answers.sort((a, b) => {
      return b.shares_count - a.shares_count;
    });

    const uniqueUsernames = new Set();
    const uniqueSortedAnswers = sortedAnswers.filter(answer => {
      const username = answer.submitter.username;
      if (uniqueUsernames.has(username)) {
        return false;
      } else {
        uniqueUsernames.add(username);
        return true;
      }
    });
    sortedAnswers = uniqueSortedAnswers;
    if (sortedAnswers.length > 0) {
      return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ color: '#000000' }}>See answers by:</p>
          <div style={{ display: 'flex', flexDirection: 'column', }}>
            {sortedAnswers.map((answer, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: 0, marginTop: 0 }}>
                <div onClick={() => router.push(`/qa/${answer['question_id']}`)} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: index == 0 ? '1vh' : '1vh' }}>
                  {answer["submitter"] && answer["submitter"]["username"] && !brokenImages.has(answer["submitter"]["username"]) &&
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/users/photo/${answer["submitter"]["username"]}`}
                      alt="Profile Photo"
                      onError={() => handleImageError(answer["submitter"]["username"])}
                      style={{ borderRadius: '50%', width: '3vh', height: '3vh', alignSelf: 'center', marginRight: '1vh' }} />
                  }
                  <p style={{ color: '#006233' }}>{answer["submitter"]["username"]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    } else {
      return <p style={{ color: 'black' }}>No answers yet! Read or listened to an answer? Share in the answers section.</p>;
    }
  };

  const options = {};


  const answeredCount = QnAs?.filter(q => q.answers.length > 0 && (!selectedTag || tagMap.get(selectedTag).has(q.id))).length
  const unansweredCount = QnAs?.filter(q => q.answers.length == 0 && (!selectedTag || tagMap.get(selectedTag).has(q.id))).length

  return (
    <div>
      <Head>
        <title>AskPalestine</title>
        <meta name="description" content="Application for pro-palestinians to read and share questions and answers " />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      {isGettingQuestions && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: '1vh', paddingTop: '2vh' }}>
        <Loading></Loading>
      </div>}
      {!isGettingQuestions && <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', justifyItems: 'center', alignContent: 'center', gap: '5px', paddingBottom: '15px' }}>
          <input
            className={styles.searchInput}
            type="text"
            name="name"
            value={searchText}
            placeholder="Search for a question..."
            onChange={(searchText) => {
              setSearchText(searchText.target.value)
              console.log(searchText.target.value.length)
              if (searchText.target.value.length == 0) {
                getQuestions()
              } 
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && searchError() == "") { searchQuestions() } }}
          />



          {searchText.trim().length > 0 &&
            <motion.div
              initial={{ opacity: 0, }}
              animate={{ opacity: 1, }}
              style={{ width: '75%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', justifyItems: 'center', alignContent: 'center' }}
              transition={{ duration: 1 }}>
              <ActionButton
                className={searchError() == "" ? styles.searchQuestionsButton : styles.searchQuestionsButtonError}
                type="view"
                onClick={() => {
                  if (searchError() == "") { searchQuestions() }
                }}>
                   {searchButtonText()}
              </ActionButton>
            </motion.div>
          }
        </div>
        <div className={styles.gridContainer}>


          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: '1vh' }}>
            <ActionButton className={showAnswered ? styles.AnsweredToggleSelected : styles.AnsweredToggleUnselected} type="view" onClick={() => { setShowAnswered(true) }}>Answered ({answeredCount})</ActionButton>
            <div style={{ width: '2vw' }}></div>
            <ActionButton className={showAnswered ? styles.AnsweredToggleUnselected : styles.AnsweredToggleSelected} type="view" onClick={() => { setShowAnswered(false) }}>Unanswered ({unansweredCount})</ActionButton>
          </div>

          <Grid className={styles.grid}>
            {QnAs?.filter(q => (!selectedTag || tagMap.get(selectedTag).has(q.id)) && (showAnswered && q.answers.length > 0 || !showAnswered && q.answers.length == 0)).map((QnA, i) => (
              <Card className={styles.questionCardContainer} key={i}>
                {QnA["question_forms"].length > 1 && (
                  <div style={{ padding: '8px', color: '#006233' }}>
                    <b>Related Questions:</b>
                  </div>
                )}
                <h3 className={styles.cardHeader}>
                  <div style={{ whiteSpace: "pre-wrap", textAlign: 'start' }}>
                    {QnA["question_forms"].map((form, index) => (
                      <div key={index} style={{ padding: '8px' }}>
                        {QnA["question_forms"].length > 1 ? "Q: " + form : form}
                      </div>
                    ))}
                  </div>                </h3>
                <div>
                  <div className={styles.cardDetails}>
                    <motion.div
                      initial={{ height: 0, }}
                      animate={{ height: 'fit-content' }}
                      transition={{ duration: 0.5 }}
                    >
                      {getSortedAnswers(QnA)}
                    </motion.div>
                  </div>
                  <div className={styles.readMoreButtonContainer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <div style={{ paddingRight: '1vh', color: '#000000' }}>
                        {QnA["views_count"]}
                      </div>
                      {eyeIcon}
                    </div>
                    <ActionButton
                      className={styles.readMoreButton}
                      onClick={() => { router.push(`/qa/${QnA['id']}`) }}
                      type="view"
                    >
                      {QnA["answers"].length > 0 ? "Read More" : "Answer"}
                    </ActionButton>
                  </div>
                </div>

              </Card>
            ))}
          </Grid>
        </div>
        {isAddingQuestion && <Card className={styles.questionCardContainer} style={{ maxHeight: "15em" }}>
          <div className={detailedStyles.communityQuestionsInputContainer}>
            <div className={detailedStyles.communityQuestionsInput}>
              <TextField value={userQuestion} onChange={() => setUserQuestion(userQuestionRef.current.value)} maxLength={300} placeholder="Write your own question..." multiline inputRef={userQuestionRef} />
            </div>
            <IconButton onClick={() => submitQuestion()} alt="Submit" className={detailedStyles.submitButton}>
              <PlaneIcon fill="#006233" />
            </IconButton>
          </div>
        </Card>}
        {<ActionButton
          className={styles.addQuestionButton}
          type="view"
          onClick={() => {
            setIsAddingQuestion(!isAddingQuestion)
          }}
        >
          Didn&apos;t find your question? Submit a new one...
        </ActionButton>}

      </div>}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
    },
  };
};

export default QnA;
