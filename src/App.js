import { useState, useEffect } from "react";
const appboy = require("@braze/web-sdk");
const USER_ID = "ae143444-0e26-4eda-8bfa-4dcec82b2250";
const SESSION_ID = Math.random().toString().replace(".", "");

function App() {
  window.appboy = appboy;
  console.log("SESSION_ID", SESSION_ID);
  const [isSending, setIsSending] = useState(false);
  useEffect(() => {
    const initializeAppboy = () => {
      appboy.initialize("3d0e6267-6e58-4da3-b52b-a4996f9ffbcb", {
        baseUrl: "https://sdk.iad-03.appboy.com/api/v3",
        enabbleLoggin: true,
        minimumIntervalBetweenTriggerActionsInSeconds: 1,
      });

      appboy.openSession();
      appboy.changeUser(SESSION_ID);

      appboy.subscribeToInAppMessage((inAppMessage) => {
        appboy.display.showInAppMessage(inAppMessage);
      });
    };

    const subscribeToSegmentationController = () => {
      const url = `https://poc-segmentation-api.herokuapp.com/api/v1/segmentation-controller/subscribe?sessionId=${SESSION_ID}`;
      const eventSource = new EventSource(url);

      eventSource.addEventListener("onUpdate", (e) => {
        const data = JSON.parse(e.data);
        console.log(new Date(), data);
        appboy.logCustomEvent(data.eventName);
      });

      eventSource.addEventListener("error", (e) => {
        /*if(e.currentTarget.readyState !== EventSource.CLOSED) {
          eventSource.close();
          console.error('Error onUpdate event stream');
        }*/
      });
    };

    initializeAppboy();
    subscribeToSegmentationController();
  }, []);

  const onClickTriggerEventButton = (e) => {
    setIsSending(true);
    fetch(
      `https://poc-segmentation-api.herokuapp.com/api/v1/segmentation-controller?sessionId=${SESSION_ID}`,
      {
        method: "POST",
        cache: "no-cache",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          eventName: "Load_Dashboard",
          payload: JSON.stringify({
            userId: USER_ID,
            time: new Date(),
          }),
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setIsSending(false);
      });
  };

  return (
    <div className="container">
      <button type="button" onClick={onClickTriggerEventButton}>
        {isSending ? "Sending Event..." : "Trigger Event"}
      </button>
    </div>
  );
}

export default App;
