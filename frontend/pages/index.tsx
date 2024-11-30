import styles from "../styles/QnA.module.css";
import { GetStaticProps } from "next";
import Card from "@/components/Card/Card";
import ActionButton from "@/components/ActionButton/ActionButton";
import actionButtonStyles from '@/components/ActionButton/ActionButton.module.css';
import Link from "next/link";
import * as React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react'
import CountUp from 'react-countup';
import Script from 'next/script'
import { motion } from "framer-motion"
import Head from 'next/head';
import { MdOutlineLaunch } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";


export const Home = (props) => {
  const router = useRouter();

  const [acceptedQuestionsCount, setAcceptedQuestionsCount] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [totalViewsCount, setTotalViewsCount] = useState(0);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const [brokenImages, setBrokenImages] = useState(new Set());
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isWhyAskPalestineExpanded, setIsWhyAskPalestineExpanded] = useState(false);
  const [isHowToUseAskPalestineExpanded, setIsHowToUseAskPalestineExpanded] = useState(false);

  const handleImageError = (username) => {
    setBrokenImages((prevBrokenImages) => new Set([...prevBrokenImages, username]));
  };

  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  };

  useEffect(() => {
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
    setIsIos(Boolean(userAgent.match(/iPhone|iPad|iPod/i)));
    setIsAndroid(Boolean(userAgent.match(/Android/i)));
    fetchData('/stats/accepted_questions_count/').then(data => {
      if (data) {
        setAcceptedQuestionsCount(data.accepted_questions_count);
      }
    });

    fetchData('/stats/answers_count/').then(data => {
      if (data) {
        setAnswersCount(data.answers_count);
      }
    });


    fetchData('/stats/total_views_count/').then(data => {
      if (data) {
        setTotalViewsCount(data.total_views_count);
      }
    });
  }, []);

  useEffect(() => {
    fetchData('/stats/usernames/').then(data => {
      if (data) {
        const updatedUsers = data.usernames.map(username => {
          return {
            username,
            photoUrl: `${baseUrl}/users/photo/${username}`
          };
        });
        setUsers(updatedUsers);
      }
    });
  }, []);


  const eyeIcon = <svg fill="#000000" height="2vh" width="2vh" version="1.1" id="Capa_1"
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


  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', }}>
      <ToastContainer />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-MRM1C10PF4" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-MRM1C10PF4');
        `}
      </Script>

      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '2px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
          <p style={{ fontSize: '40px', color: 'green' }}>
            <b><CountUp end={acceptedQuestionsCount} duration={2.75} /></b>
          </p>
          <p style={{ textAlign: 'center' }}> Questions</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '40px', color: 'green' }}>
            <b>
              <CountUp end={totalViewsCount / 1000} decimals={1} duration={2.75} />K
            </b>
          </p>
          <p style={{ textAlign: 'center' }}> Reads</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
          <p style={{ fontSize: '40px', color: 'green' }}>
            <b><CountUp end={answersCount} duration={2.75} /></b>
          </p>
          <p style={{ textAlign: 'center' }}> Answers</p>
        </div>

      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', paddingTop: '20px' }}>
        {users.map((user, index) => (
          <Link key={index} href={`/users/${user.username}`}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {!brokenImages.has(user.username) && (
                <motion.img
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  src={user.photoUrl}
                  alt={`${user.username}'s profile`}
                  onError={() => handleImageError(user.username)}
                  style={{ borderRadius: '50%', width: '5vh', height: '5vh', marginRight: '5px' }}
                />
              )}
            </div>
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: '20px' }}>
        {isIos && <Link
          href="https://apps.apple.com/us/app/askpalestine/id6474973164?itsct=apps_box_badge&amp;itscg=30200"
          style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} // Centering content within the link
        >
          <img
            style={{ width: '150px', height: '60px', objectFit: 'fill' }}  // Set a fixed width and height
            src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1703635200"
            alt="Download on the App Store"
          />
        </Link>}

        {isAndroid && <Link
          href='https://play.google.com/store/apps/details?id=askpalestine.info&hl=en&gl=US&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
          style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} // Centering content within the link
        >
          <img
            alt='Get it on Google Play'
            style={{ width: '185px', height: '80px', objectFit: 'fill' }}  // Set a fixed width and height
            onClick={() => { }}
            src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'
          />
        </Link>}
      </div>
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
        style={{ display: 'flex', flexDirection: 'column', paddingTop: '2vh', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Card
            style={{ height: 'fit-content', backgroundColor: 'black', border: 'none', borderRadius: '3em', width: '100%', padding: '20px' }}>
            <div
              onClick={() => setIsWhyAskPalestineExpanded(!isWhyAskPalestineExpanded)}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <IoMdArrowDropdown color="black" size={"40px"} visibility={0} style={{ visibility: 'hidden' }} />
                <p style={{ fontSize: 'clamp(0px, 7vw, 40px)', color: '#F8F8FF', textAlign: 'center', paddingRight: '2vw' }}><b>Why</b></p>
                <IoMdArrowDropdown color="white" size={"40px"} />
              </div>
            </div>
            {isWhyAskPalestineExpanded &&
              <div>
                <br></br>
                <motion.p
                  initial={{ height: 0, }}
                  animate={{ height: 'fit-content' }}
                  transition={{ duration: 0.5 }}
                  style={{ textAlign: 'center', fontSize: 'clamp(0px, 4vw, 20px)', color: '#F8F8FF' }}>
                  It&apos;s not easy to find the right words when questions come. That&apos;s why we built AskPalestine. It is for every pro-Palestinian to read and share answers that show the truth while not falling into the traps of misleading narratives. AskPalestine is there to give you the strength to speak up with confidence. Together, we&apos;ll make our voices heard.
                </motion.p>
              </div>
            }
          </Card>
        </div>
      </motion.div>


      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, }} transition={{ duration: 1 }}
          style={{ display: 'flex', flexDirection: 'column', paddingTop: '1vh', width: '100%' }}>
          <Card style={{ height: 'fit-content', borderRadius: '3em', border: 'none', padding: '20px' }}>

            <div onClick={() => setIsHowToUseAskPalestineExpanded(!isHowToUseAskPalestineExpanded)} >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <IoMdArrowDropdown color="black" size={"40px"} visibility={0} style={{ visibility: 'hidden' }} />
                <p style={{ fontSize: 'clamp(0px, 7vw, 40px)', textAlign: 'center', paddingRight: '2vw' }}><b>How</b></p>
                <IoMdArrowDropdown color="black" size={"40px"} />
              </div>
            </div>
            {isHowToUseAskPalestineExpanded &&
              <motion.div
                initial={{ height: 0, }}
                animate={{ height: 'fit-content' }}
                transition={{ duration: 0.5 }}
              >
                <ul className={styles.landingPageUl} >
                  <li>Want to train on how to answer questions? <Link style={{ color: '#006233' }} href="/qa"><b>Read answers</b></Link></li>
                  <li>Want to know when new answers or questions are added? <Link style={{ color: '#006233' }} href="/menu"><b>Subscribe</b></Link></li>
                  <li>Listened to or read an answer to a question? <b>Submit it</b></li>
                </ul>
              </motion.div>
            }
          </Card>
        </motion.div>
      </div>
      <motion.div
      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, }} transition={{ duration: 1 }}
       style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
        <ActionButton
          className={actionButtonStyles.goToQAButton}
          onClick={() => router.push('/qa')}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }}>
            <p style={{ paddingRight: '17px' }}>Go</p>
            <MdOutlineLaunch size={'35px'} />
          </div>
        </ActionButton>
      </motion.div>

      
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      title: "Q & A",
    },
  };
};

export default Home;
