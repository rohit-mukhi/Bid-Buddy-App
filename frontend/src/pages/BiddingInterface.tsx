import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'

export default function BiddingInterface() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !user.isBidder) {
      navigate('/home')
    }
  }, [user, navigate])

  if (!user?.isBidder) {
    return null
  }

  return (
    <div className="min-vh-100 bg-dark text-white">
      <Navbar showBackButton={true} />

      <div className="container py-5">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <h1 className="display-4 fw-bold mb-4" style={{ color: 'var(--teal)' }} data-aos="fade-down">
              Bidding Interface
            </h1>
            <p className="lead mb-5" data-aos="fade-up" data-aos-delay="100">Browse and place bids on active auctions</p>

            <div className="row g-4">
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="0">
                <div className="card bg-dark-card border-secondary h-100">
                  <img
                    src="https://via.placeholder.com/300x200?text=Vintage+Watch"
                    className="card-img-top"
                    alt="Vintage Watch"
                  />
                  <div className="card-body">
                    <h5 className="card-title" style={{ color: 'var(--teal)' }}>
                      Vintage Leather Watch
                    </h5>
                    <p className="text-muted mb-2">Current Bid: $450</p>
                    <p className="text-muted mb-3">Time Left: 2h 30m</p>
                    <button className="btn btn-primary w-100">Place Bid</button>
                  </div>
                </div>
              </div>

              <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                <div className="card bg-dark-card border-secondary h-100">
                  <img
                    src="https://via.placeholder.com/300x200?text=Wooden+Clock"
                    className="card-img-top"
                    alt="Wooden Clock"
                  />
                  <div className="card-body">
                    <h5 className="card-title" style={{ color: 'var(--teal)' }}>
                      Antique Wooden Clock
                    </h5>
                    <p className="text-muted mb-2">Current Bid: $320</p>
                    <p className="text-muted mb-3">Time Left: 5h 15m</p>
                    <button className="btn btn-primary w-100">Place Bid</button>
                  </div>
                </div>
              </div>

              <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                <div className="card bg-dark-card border-secondary h-100">
                  <img
                    src="https://via.placeholder.com/300x200?text=Camera"
                    className="card-img-top"
                    alt="Camera"
                  />
                  <div className="card-body">
                    <h5 className="card-title" style={{ color: 'var(--teal)' }}>
                      Classic Camera Collection
                    </h5>
                    <p className="text-muted mb-2">Current Bid: $680</p>
                    <p className="text-muted mb-3">Time Left: 1h 45m</p>
                    <button className="btn btn-primary w-100">Place Bid</button>
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
