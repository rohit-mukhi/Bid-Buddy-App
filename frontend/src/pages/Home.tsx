import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Home() {
  const { session, user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleRoleSelection = async (role: 'admin' | 'bidder') => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          isAdmin: role === 'admin',
          isBidder: role === 'bidder',
        }),
      })

      if (!response.ok) throw new Error('Failed to update role')

      const data = await response.json()
      localStorage.setItem('jwt_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/bidding')
      }

      // Reload to update context
      window.location.reload()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role. Please try again.')
    }
  }

  return (
    <div className="min-vh-100 bg-dark text-white">
      <Navbar showBackButton={false} />

      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <h1 className="display-4 fw-bold mb-1 text-left" style={{ color: 'var(--teal)' }} data-aos="fade-down">
              Choose Your Role
            </h1>
            <p className="lead mb-5 text-left" data-aos="fade-up" data-aos-delay="100">
              Welcome, {session?.user?.email?.split('@')[0]}
            </p>
            
            <div className="row g-4 mt-5">
              <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
                <div 
                  className="card bg-dark-card border-secondary" 
                  style={{ 
                    cursor: 'pointer',
                    minHeight: '220px'
                  }}
                  onClick={() => handleRoleSelection('admin')}
                >
                  <div className="card-body text-center d-flex flex-column justify-content-center">
                    <div className="display-4 mb-3">📝</div>
                    <h5 className="card-title" style={{ color: 'var(--teal)' }}>I want to Sell</h5>
                    <p className="card-text text-muted mb-2">Create and manage auctions as a seller</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
                <div 
                  className="card bg-dark-card border-secondary" 
                  style={{ 
                    cursor: 'pointer',
                    minHeight: '220px'
                  }}
                  onClick={() => handleRoleSelection('bidder')}
                >
                  <div className="card-body text-center d-flex flex-column justify-content-center">
                    <div className="display-4 mb-3">💰</div>
                    <h5 className="card-title" style={{ color: 'var(--teal)' }}>I want to Bid</h5>
                    <p className="card-text text-muted mb-2">Browse and place bids on items</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
