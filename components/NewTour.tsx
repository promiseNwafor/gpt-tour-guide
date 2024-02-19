'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  TourResponse,
  createNewTour,
  fetchUserTokensById,
  generateTourResponse,
  getExistingTour,
  subtractTokens,
} from '@/utils/actions'
import toast from 'react-hot-toast'
import TourInfo from '@/components/TourInfo'
import { useAuth } from '@clerk/nextjs'

const NewTour = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  const {
    mutate,
    isPending,
    data: tour,
  } = useMutation({
    mutationFn: async (destination: TourResponse) => {
      const existingTour = await getExistingTour(destination)
      if (existingTour) return existingTour

      const currentTokens = (await fetchUserTokensById(
        userId as string
      )) as number

      if (currentTokens < 300) {
        toast.error('Token balance too low....')
        return
      }

      const newTour = await generateTourResponse(destination)
      if (!newTour) {
        toast.error('No matching city found...')
        return null
      }

      await createNewTour(newTour.tour)
      queryClient.invalidateQueries({ queryKey: ['tours'] })

      const newTokens = await subtractTokens(userId as string, newTour.tokens)
      toast.success(`${newTokens} tokens remaining...`)

      return newTour.tour
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const destination = Object.fromEntries(formData.entries()) as any
    mutate(destination)
  }

  if (isPending) {
    return <span className='loading loading-lg'></span>
  }

  return (
    <>
      <form onSubmit={handleSubmit} className='max-w-2xl'>
        <h2 className=' mb-4'>Select your dream destination</h2>
        <div className='join w-full'>
          <input
            type='text'
            className='input input-bordered join-item w-full'
            placeholder='city'
            name='city'
            required
          />
          <input
            type='text'
            className='input input-bordered join-item w-full'
            placeholder='country'
            name='country'
            required
          />
          <button
            className='btn btn-primary join-item'
            type='submit'
            disabled={isPending}
          >
            {isPending ? 'please wait...' : 'generate tour'}
          </button>
        </div>
      </form>
      <div className='mt-16'>
        <div className='mt-16'>{tour ? <TourInfo tour={tour} /> : null}</div>
      </div>
    </>
  )
}
export default NewTour
