import Input from "@/components/Input/Input";
import ActionButton from '@/components/ActionButton/ActionButton';
import { useRouter } from 'next/router';
import Card from '@/components/Card/Card';
import { ToastContainer, toast } from 'react-toastify';
import { PlaneIcon } from "@/assets/svgs";
import 'react-toastify/dist/ReactToastify.css';
import styles from './menuStyles.module.css'
import TextField from "@/components/TextField/TextField";
import IconButton from "@/components/IconButton/IconButton";
import { useEffect, useRef, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";

const Menu = () => {
  const userEmailRef = useRef<HTMLInputElement>()
  const [userEmail, setUserEmail] = useState<string>("")
  const router = useRouter();

  const subscribe = async () => {
    try {
      let email = userEmailRef.current.value
      if (!email.includes('@')) {
        toast.error("Invalid email format");
        return
      }

      if (email === '') {
        toast.error("Please fill in all fields");
        return
      }
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/subscribe/", {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          email,
        })
      });

      userEmailRef.current.value = ""
      setUserEmail("")
      if (response.ok) {
        toast.success("Subscribed successfully! You will receive an email when new questions are posted",
          {
            autoClose: 4000,
            hideProgressBar: true,
            draggable: false,
            closeOnClick: true,
          });
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
      toast.error("Error subscribing", {
        autoClose: 4000,
        hideProgressBar: true,
        draggable: false,
        closeOnClick: true,
      });
    }
  };

  return (
    <div className={styles.menuContainer}>
      <ToastContainer />
      <Card className={styles.menuContainer}>
        
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'auto' }}>

            <br></br>
            <p className={styles.menuButtonDescriptions}>Want to get emails for new questions and answers?</p>
            
              <Card style={{
                padding: '1vh',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                height: 'fit-content',
                color: '#006233',
                flex: '1',
                overflow: 'hidden',
                width: '70%',
                border: '2px solid #006233',
              }}>
                <div className={styles.emailSubscriptionField}>
                  <TextField value={userEmail} onChange={()=>{setUserEmail(userEmailRef.current.value)}} placeholder="Type your email..." multiline inputRef={userEmailRef}></TextField>
                  <IconButton onClick={() => subscribe()} alt="Submit" className={styles.submitButton}>
                    <PlaneIcon fill="#006233" />
                  </IconButton>
                </div>
              </Card>
           
          </div>
      </Card >
    </div >
  );
}

export default Menu;