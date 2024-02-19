// import { fetchOrGenerateTokens } from '@/utils/actions';
import { UserButton, auth, currentUser } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'

const MemberProfile = async () => {
  const user = (await currentUser()) as User
  const { userId } = auth()
  // await fetchOrGenerateTokens(userId);
  return (
    <div className='px-4 flex items-center gap-2'>
      <UserButton afterSignOutUrl='/' />
      <p>{user.emailAddresses[0].emailAddress}</p>
    </div>
  )
}
export default MemberProfile
