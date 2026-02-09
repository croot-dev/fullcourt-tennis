'use client'

import { useEffect } from 'react'
import {
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  Portal,
  Stack,
  Textarea,
  Checkbox,
  NativeSelect,
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { useCreateCourt, useUpdateCourt } from '@/hooks/useCourt'
import { toaster } from '@/components/ui/toaster'
import {
  COURT_TYPE,
  COURT_TYPE_LABEL,
  COURT_AMENITY_LIST,
  COURT_AMENITY_LABEL,
  type CourtType,
  type CourtAmenity,
} from '@/constants'
import type { TennisCourt } from '@/domains/court/court.model'

interface CourtFormDialogProps {
  open: boolean
  court: TennisCourt | null
  onClose: () => void
}

interface FormValues {
  name: string
  naver_place_id: string
  naver_business_id: string
  rsv_url: string
  address: string
  is_indoor: string
  court_type: string
  court_count: number | null
  amenities: CourtAmenity[]
  tags: string
  memo: string
}

export default function CourtFormDialog({
  open,
  court,
  onClose,
}: CourtFormDialogProps) {
  const createCourt = useCreateCourt()
  const updateCourt = useUpdateCourt()
  const isEditing = !!court

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      naver_place_id: '',
      naver_business_id: '',
      rsv_url: '',
      address: '',
      is_indoor: '',
      court_type: '',
      court_count: null,
      amenities: [],
      tags: '',
      memo: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (court) {
        reset({
          name: court.name,
          naver_place_id: court.naver_place_id || '',
          naver_business_id: court.naver_business_id || '',
          rsv_url: court.rsv_url || '',
          address: court.address || '',
          is_indoor: court.is_indoor === null ? '' : String(court.is_indoor),
          court_type: court.court_type || '',
          court_count: court.court_count,
          amenities: court.amenities || [],
          tags: court.tags?.join(', ') || '',
          memo: court.memo || '',
        })
      } else {
        reset({
          name: '',
          naver_place_id: '',
          naver_business_id: '',
          rsv_url: '',
          address: '',
          is_indoor: '',
          court_type: '',
          court_count: null,
          amenities: [],
          tags: '',
          memo: '',
        })
      }
    }
  }, [open, court, reset])

  const handleClose = () => {
    onClose()
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        name: data.name,
        naver_place_id: data.naver_place_id || null,
        rsv_url: data.rsv_url || null,
        naver_business_id: data.naver_business_id || null,
        address: data.address || null,
        is_indoor: data.is_indoor === '' ? null : data.is_indoor === 'true',
        court_type: (data.court_type || null) as CourtType | null,
        court_count: data.court_count,
        amenities: data.amenities.length > 0 ? data.amenities : null,
        tags: data.tags
          ? data.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : null,
        memo: data.memo || null,
      }

      if (isEditing && court) {
        await updateCourt.mutateAsync({
          court_id: court.court_id,
          ...payload,
        })
        toaster.success({ title: '코트가 수정되었습니다.' })
      } else {
        await createCourt.mutateAsync(payload)
        toaster.success({ title: '코트가 추가되었습니다.' })
      }
      handleClose()
    } catch {
      toaster.error({
        title: isEditing
          ? '코트 수정에 실패했습니다.'
          : '코트 추가에 실패했습니다.',
      })
    }
  })

  const isPending = createCourt.isPending || updateCourt.isPending

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="600px">
            <Dialog.Header>
              <Dialog.Title>
                {isEditing ? '코트 수정' : '코트 추가'}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root invalid={!!errors.name} required>
                  <Field.Label>코트 이름</Field.Label>
                  <Input
                    placeholder="코트 이름"
                    {...register('name', {
                      required: '코트 이름을 입력해주세요',
                    })}
                  />
                  <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>주소</Field.Label>
                  <Input placeholder="주소" {...register('address')} />
                </Field.Root>

                <Flex gap={3}>
                  <Field.Root flex={1}>
                    <Field.Label>실내/실외</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field {...register('is_indoor')}>
                        <option value="">선택안함</option>
                        <option value="true">실내</option>
                        <option value="false">실외</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root flex={1}>
                    <Field.Label>코트 타입</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field {...register('court_type')}>
                        <option value="">선택안함</option>
                        {Object.values(COURT_TYPE).map((type) => (
                          <option key={type} value={type}>
                            {COURT_TYPE_LABEL[type]}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </Flex>

                <Field.Root>
                  <Field.Label>코트 수</Field.Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="코트 수"
                    {...register('court_count', { valueAsNumber: true })}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>네이버 플레이스 ID</Field.Label>
                  <Input
                    placeholder="네이버 플레이스 ID"
                    {...register('naver_place_id')}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>네이버 예약 Business ID</Field.Label>
                  <Input
                    placeholder="예: 767366"
                    {...register('naver_business_id')}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>예약 URL</Field.Label>
                  <Input placeholder="https://..." {...register('rsv_url')} />
                </Field.Root>

                <Field.Root>
                  <Field.Label>편의시설</Field.Label>
                  <Controller
                    name="amenities"
                    control={control}
                    render={({ field }) => (
                      <Flex gap={2} flexWrap="wrap">
                        <Checkbox.Group
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          {COURT_AMENITY_LIST.map((amenity) => (
                            <Checkbox.Root
                              key={amenity}
                              value={amenity}
                              htmlFor={`amenity-${amenity}`}
                            >
                              <Checkbox.HiddenInput id={`amenity-${amenity}`} />
                              <Checkbox.Control />
                              <Checkbox.Label>
                                {COURT_AMENITY_LABEL[amenity]}
                              </Checkbox.Label>
                            </Checkbox.Root>
                          ))}
                        </Checkbox.Group>
                      </Flex>
                    )}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>태그</Field.Label>
                  <Input
                    placeholder="쉼표로 구분 (예: 주차편리, 야간조명)"
                    {...register('tags')}
                  />
                  <Field.HelperText>쉼표(,)로 구분하여 입력</Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>메모</Field.Label>
                  <Textarea
                    placeholder="관리자 메모"
                    rows={3}
                    {...register('memo')}
                  />
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button
                colorPalette="teal"
                onClick={onSubmit}
                loading={isPending}
              >
                {isEditing ? '수정' : '추가'}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
