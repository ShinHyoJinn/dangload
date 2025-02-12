"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "./Dbti_result.css"

const DbtiResult = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { mbti } = location.state || {}

  // 만약 mbti 값이 없으면 홈이나 테스트 페이지로 리다이렉트
  useEffect(() => {
    if (!mbti) {
      navigate("/", { replace: true })
    }
  }, [mbti, navigate])

  const handleRegister = async () => {
    // 만약 "등록하기" 버튼 클릭 시 추가 API 호출이나 다른 페이지 이동이 필요하다면
    // 예시) /register 페이지로 이동하면서 결과를 전달
    navigate("/register", { state: { mbti } })

    // 또는 API 호출 예시:
    // try {
    //   const response = await fetch('/api/registerMbtiResult', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ mbti }),
    //   })
    //   if(response.ok){
    //     // 등록 성공 후 다른 페이지로 이동하거나 메시지 표시
    //     navigate("/success")
    //   }
    // } catch (error) {
    //   console.error("등록 실패:", error)
    // }
  }

  return (
    <div className="DbtiResult-container">
      {/* 헤더 */}
      <header className="DbtiResult-header">
        <div className="DbtiResult-header-content">
          <img
            src="/resultlasticons/back.png"
            alt="뒤로가기"
            className="DbtiResult-back-icon"
            onClick={() => navigate(-1)}
          />
          <h1>멍BTI TEST</h1>
          <p className="DbtiResult-description">우리 댕댕이의 멍BTI를 검사해보세요!</p>
        </div>
      </header>

      {/* 결과 박스 */}
      <div className="DbtiResult-box">
        {mbti ? (
          <p className="DbtiResult-text">당신의 강아지 MBTI : {mbti}</p>
        ) : (
          <p className="DbtiResult-text">결과를 불러올 수 없습니다.</p>
        )}
      </div>

      {/* 등록하기 버튼 */}
      <button className="DbtiResult-button"        
      onClick={() => navigate("/DogInformationPage", { state: { mbti } })}>
        등록하기
      </button>
    </div>
  )
}

export default DbtiResult
