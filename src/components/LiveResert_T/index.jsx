"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Map from "../Map";
import "./LiveResert_T.css";

export default function LiveResert_T({}) {
  const [activeTab, setActiveTab] = useState("walk");
  const [feedback, setFeedback] = useState(""); // 특이사항 입력 상태
  const [walkData, setWalkData] = useState({ distance: 0, steps: 0, time: 0 });

  // 강아지 및 트레이너 정보 상태 추가
  const [dogInfo, setDogInfo] = useState({
    name: "반려견",
    image_url: "/dogprofile/dog.jpg",
  });
  const [trainerInfo, setTrainerInfo] = useState({
    image_url: "/trainerprofile/trainer.jpg",
  });
  const [isLoading, setIsLoading] = useState(true);

  // 강아지 및 트레이너 정보 불러오기
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        // 현재 로그인한 사용자 정보 가져오기
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("로그인이 필요합니다:", userError);
          return;
        }

        // 강아지 정보 가져오기
        const { data: petData, error: petError } = await supabase
          .from("pets")
          .select("name, image_url")
          .eq("uuid_id", user.id)
          .maybeSingle();

        if (petError) {
          console.error("강아지 정보 조회 실패:", petError);
        } else if (petData) {
          setDogInfo({
            name: petData.name || "반려견",
            image_url: petData.image_url || "/dogprofile/dog.jpg",
          });
        }

        // 트레이너 정보 가져오기
        const { data: trainerData, error: trainerError } = await supabase
          .from("trainers")
          .select("trainer_image_url")
          .eq("uuid_id", user.id)
          .maybeSingle();

        if (trainerError) {
          console.error("트레이너 정보 조회 실패:", trainerError);
        } else if (trainerData) {
          setTrainerInfo({
            image_url: trainerData.trainer_image_url || "/trainerprofile/trainer.jpg",
          });
        }
      } catch (error) {
        console.error("프로필 데이터 로딩 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Map에서 받은 데이터 저장
  const handleRouteData = (data) => {
    setWalkData({
      distance: data.distance || 0,
      steps: data.steps || 0,
      time: data.time || 0,
    });
  };

  // ✅ 저장 버튼 클릭 시 산책 데이터 저장
  const saveWalkingRoute = () => {
    const walkReport = {
      date: new Date().toLocaleDateString(),
      dogName: dogInfo.name,
      dogImage: dogInfo.image_url,
      trainerImage: trainerInfo.image_url,
      distance: walkData.distance || 0,
      steps: walkData.steps || 0,
      time: walkData.time || 0,
      feedback: feedback || "",
    };

    console.log("📤 저장할 산책 데이터:", JSON.stringify(walkReport, null, 2));

    // ✅ localStorage에 데이터 저장
    localStorage.setItem("walkReport", JSON.stringify(walkReport));
  
    // ✅ storage 이벤트 강제 트리거 → LiveResert에서 변경 감지 가능
    window.dispatchEvent(new Event("storage"));
  
    // ✅ 1초 뒤에 Live 페이지로 페이지 변경 메시지 전송
    setTimeout(() => {
      const navigationData = {
        timestamp: new Date().getTime(),
        action: "navigate",
        target: "/LiveResertPage",
        id: Math.random().toString(36).substring(2, 9),
      };
  
      localStorage.setItem("navigationTrigger", JSON.stringify(navigationData));
  
      // ✅ BroadcastChannel을 통한 메시지 전송
      try {
        const bc = new BroadcastChannel("navigation_channel");
        bc.postMessage(navigationData);
        bc.close();
      } catch (error) {
        console.error("브로드캐스트 채널 오류:", error);
      }
    }, 1000); // ⏳ 1초 대기 후 Live 페이지 이동 트리거 전송
  
    alert("산책 데이터가 성공적으로 저장되었습니다!");
  
    // ✅ 1초 뒤에 Profile_TPage로 이동
    setTimeout(() => {
      window.location.href = "/Profile_TPage";
    }, 1000);
  };

  
  return (
    <div className="LiveResert_T-container" style={{ minHeight: "100%", overflowY: "auto" }}>
      <header className="LiveResert_T-header">
        <div className="LiveResert_T-header-content">
          <h1>라이브</h1>
          <div className="LiveResert_T-header-buttons">
            <button
              className={`LiveResert_T-header-button ${activeTab === "walk" ? "active" : ""}`}
              onClick={() => setActiveTab("walk")}
            >
              산책 경로
            </button>
            <button
              className={`LiveResert_T-header-button ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              채팅 하기
            </button>
          </div>
        </div>
      </header>

      {/* 산책 경로 탭 */}
      {activeTab === "walk" && (
        <div className="LiveResert_T-container">
          <Map onDataReady={handleRouteData} />
          <div className="LiveResert_T-walk-report-card">
            <div className="LiveResert_T-report-date">{new Date().toLocaleDateString()}</div>
            <div className="LiveResert_T-report-title">{isLoading ? "로딩 중..." : `${dogInfo.name} 산책 리포트`}</div>

            <div className="LiveResert_T-profile-section">
              <div className="LiveResert_T-profile-circle LiveResert_T-dog-photo">
                <img
                  src={dogInfo.image_url || "/dogprofile/dog.jpg"}
                  alt="강아지사진"
                  onError={(e) => {
                    console.error("강아지 이미지 로드 실패:", e.target.src)
                    e.target.src = "/dogprofile/dog.jpg"
                  }}
                />
              </div>
              <div className="LiveResert_T-paw-prints">
                <img src="/livereserticons/paw.png" alt="발자국" className="LiveResert_T-paw-icon" />
              </div>
              <div className="LiveResert_T-profile-circle LiveResert_T-user-photo">
                <img
                  src={trainerInfo.image_url || "/trainerprofile/trainer.jpg"}
                  alt="트레이너 프로필"
                  onError={(e) => {
                    console.error("트레이너 이미지 로드 실패:", e.target.src)
                    e.target.src = "/trainerprofile/trainer.jpg"
                  }}
                />
              </div>
            </div>

            <div className="LiveResert_T-walk-details">
              <div className="LiveResert_T-detail-item">
                <h3>걸음수</h3>
                <p>{walkData.steps} 걸음</p>
              </div>

              <div className="LiveResert_T-detail-item">
                <h3>시간</h3>
                <p>{walkData.time} 분</p>
              </div>

              <div className="LiveResert_T-detail-item">
                <h3>특이사항</h3>
                <textarea
                  className="LiveResert_T-notes-box"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="산책 중 있었던 일을 입력해주세요"
                ></textarea>
              </div>
            </div>

            {/* 저장 버튼 */}
            <button className="LiveResert_T-save-button" onClick={saveWalkingRoute}>
              저장
            </button>
          </div>
        </div>
      )}

      {/* 채팅하기 탭 */}
      {activeTab === "chat" && <div className="LiveResert_T-chat-message">채팅하기</div>}
    </div>
  )
}

