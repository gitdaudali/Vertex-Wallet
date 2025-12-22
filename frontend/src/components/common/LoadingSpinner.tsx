import Loader from '../ui/Loader'

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader size="lg" />
    </div>
  )
}

export default LoadingSpinner

