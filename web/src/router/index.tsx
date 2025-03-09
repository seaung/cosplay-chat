import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ChatLayout from "../layouts"
import Login from "../views/Login"
import { RootState } from '../store'

const AppRouter = () => {
  const [loading, setLoading] = useState(true)
  const { token } = useSelector((state: RootState) => state.user)
  const isAuthenticated = !!token

  useEffect(() => {
    // 检查Redux中的token状态
    setLoading(false)
  }, [token])

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isAuthenticated ? <ChatLayout /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default AppRouter