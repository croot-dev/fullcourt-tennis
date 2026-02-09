/* Request sample */
fetch('https://m.booking.naver.com/graphql?opName=bizItems', {
  headers: {
    'content-type': 'application/json',
  },
  body: `{
  "operationName":"bizItems",
  "variables":{
    "withTypeValues":false,
    "withReviewStat":false,
    "withBookedCount":false,
    "withBizItemDetail":false,
    "input":{
        "businessId":"767366",
        "lang":"ko",
        "projections":"RESOURCE"
    }
  },
  "query":"query bizItems($input: BizItemsParams, $withTypeValues: Boolean = false, $withReviewStat: Boolean = false, $withBookedCount: Boolean = false, $withBizItemDetail: Boolean = false) {\\n  bizItems(input: $input) {\\n    ...BizItemFragment\\n    __typename\\n  }\\n}\\n\\nfragment BizItemFragment on BizItem {\\n  id\\n  agencyKey\\n  businessId\\n  bizItemId\\n  bizItemType\\n  name\\n  desc\\n  phone\\n  stock\\n  price\\n  addressJson\\n  startDate\\n  endDate\\n  refundDate\\n  availableStartDate\\n  bookingAvailableCode\\n  bookingAvailableValue\\n  bookingConfirmCode\\n  bookingTimeUnitCode\\n  isPeriodFixed\\n  isOnsitePayment\\n  isProgramBizItem\\n  isClosedBooking\\n  isClosedBookingUser\\n  isRequestMessageUsed\\n  isKopisCouponAvailable\\n  isImp\\n  rawIsImp\\n  inspectionStatusCode\\n  minBookingCount\\n  maxBookingCount\\n  minBookingTime\\n  maxBookingTime\\n  extraFeeSettingJson\\n  bookableSettingJson\\n  bookingCountSettingJson\\n  paymentSettingJson\\n  bizItemSubType\\n  priceByDates\\n  websiteUrl\\n  discountCardCode\\n  customFormJson\\n  optionCategoryMappings\\n  bizItemCategoryId\\n  additionalPropertyJson {\\n    ageRatingSetting\\n    openingHoursSetting\\n    runningTime\\n    parkingInfoSetting {\\n      isParkingSupported\\n      isFreeParking\\n      parkingCharge {\\n        chargingTypeCode\\n        basicCharge {\\n          time\\n          price\\n          isFree\\n          __typename\\n        }\\n        extraCharge {\\n          time\\n          price\\n          isFree\\n          __typename\\n        }\\n        maxPrice\\n        __typename\\n      }\\n      valetParking {\\n        valetParkingType\\n        price\\n        __typename\\n      }\\n      parkingInfoDetail\\n      __typename\\n    }\\n    ticketingTypeSetting\\n    accommodationAdditionalProperty\\n    arrangementCountSetting {\\n      isUsingHeadCount\\n      minHeadCount\\n      maxHeadCount\\n      __typename\\n    }\\n    bizItemCategorySpecificSetting {\\n      bizItemCategoryInfo {\\n        type\\n        option\\n        categoryInfoId\\n        __typename\\n      }\\n      bizItemCategoryInfoMapping\\n      eventPlaceAddress {\\n        address\\n        eventPlaceDetail\\n        order\\n        parkingInfoSetting {\\n          isParkingSupported\\n          isFreeParking\\n          parkingCharge {\\n            chargingTypeCode\\n            basicCharge {\\n              time\\n              price\\n              isFree\\n              __typename\\n            }\\n            extraCharge {\\n              time\\n              price\\n              isFree\\n              __typename\\n            }\\n            maxPrice\\n            __typename\\n          }\\n          valetParking {\\n            valetParkingType\\n            price\\n            __typename\\n          }\\n          parkingInfoDetail\\n          __typename\\n        }\\n        placeId\\n        runningTime\\n        __typename\\n      }\\n      gatheringPlaceAddress\\n      gatheringPlaceInfo {\\n        address\\n        placeId\\n        hasGatheringPlace\\n        parkingInfoSetting {\\n          isParkingSupported\\n          isFreeParking\\n          parkingCharge {\\n            chargingTypeCode\\n            basicCharge {\\n              time\\n              price\\n              isFree\\n              __typename\\n            }\\n            extraCharge {\\n              time\\n              price\\n              isFree\\n              __typename\\n            }\\n            maxPrice\\n            __typename\\n          }\\n          valetParking {\\n            valetParkingType\\n            price\\n            __typename\\n          }\\n          parkingInfoDetail\\n          __typename\\n        }\\n        __typename\\n      }\\n      gatheringPlaceParkingInfoSetting\\n      hasGatheringPlace\\n      instructorName\\n      __typename\\n    }\\n    __typename\\n  }\\n  bookingCountType\\n  isRequiringBookingOption\\n  bookingUseGuideJson {\\n    type\\n    content\\n    __typename\\n  }\\n  todayDealRate\\n  extraDescJson\\n  bookingPrecautionJson {\\n    title\\n    desc\\n    popupSetting {\\n      impStartDate\\n      impEndDate\\n      __typename\\n    }\\n    __typename\\n  }\\n  isSeatUsed\\n  isNPayUsed\\n  isDeducted\\n  isImpStock\\n  isGreenTicket\\n  orderSettingJson\\n  isRobotDeliveryAvailable\\n  bizItemAmenityJson {\\n    amenityCode\\n    amenityCategory\\n    __typename\\n  }\\n  resources {\\n    resourceUrl\\n    __typename\\n  }\\n  bizItemResources {\\n    resourceUrl\\n    bizItemResourceSeq\\n    bizItemId\\n    order\\n    resourceTypeCode\\n    regDateTime\\n    __typename\\n  }\\n  totalBookedCount @include(if: $withBookedCount)\\n  currentDateTime @include(if: $withBookedCount)\\n  reviewStatDetails @include(if: $withReviewStat) {\\n    totalCount\\n    avgRating\\n    __typename\\n  }\\n  ...BizItemTypeValues @include(if: $withTypeValues)\\n  ...MinMaxPrice\\n  ...BizItemDetail @include(if: $withBizItemDetail)\\n  __typename\\n}\\n\\nfragment BizItemTypeValues on BizItem {\\n  typeValues {\\n    bizItemId\\n    code\\n    codeValue\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment MinMaxPrice on BizItem {\\n  minMaxPrice {\\n    minPrice\\n    minNormalPrice\\n    maxPrice\\n    maxNormalPrice\\n    isSinglePrice\\n    discountRate {\\n      min\\n      max\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment BizItemDetail on BizItem {\\n  bizItemDetail {\\n    isResidentRegistrationNumberCollectionAgreed\\n    userMaxBookingCountSetting {\\n      periodType\\n      periodValue\\n      maxBookingCount\\n      __typename\\n    }\\n    bookingOpenSetting {\\n      type\\n      dailyOpenSetting {\\n        maxDaysInAdvance\\n        openTime\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}"}`,
  method: 'POST',
})

/* Response sample */
/*
{
    "data": {
        "bizItems": [
            {
                "id": "7350361_{\"businessId\":\"767366\",\"lang\":\"ko\",\"projections\":\"RESOURCE\",\"withBizItemDetail\":false,\"withBookedCount\":false,\"withReviewStat\":false,\"withTypeValues\":false}",
                "agencyKey": null,
                "businessId": "767366",
                "bizItemId": "7350361",
                "bizItemType": "STANDARD",
                "name": "2월 서울근교 난방기 빵빵한 실내테니스장",
                "desc": "일산 창고형 실내 테니스장\n가족 및 지인과 함께 프라이빗고 편안한 테니스를 즐겨보시기 바랍니다 :)\n\n※ 월대관/연대관 문의는 네이버톡톡이나 전화주세요\n(다음달 예약은 전월 15일까지)\n\n※ 주중 낮시간 대관 이용을 희망할 경우에도 네이버톡톡 및 전화주세요\n(레슨과 시간 겹치지 않을 경우 대관 가능함)\n\n※회원제멤버십을 이용하는 레슨회원님은 예약하고 대관 진행 후 연락 주시면 5천원 입금해드려요!\n\n※테니스공 대여 옵션선택 가능하고 대여하신 분들은 많은 공을 이용하니 종료 10분 전부터 정리해주세요!\n",
                "phone": null,
                "stock": 0,
                "price": null,
                "addressJson": {
                    "jibun": null,
                    "jibunDetail": null,
                    "roadAddr": null,
                    "roadDetail": null,
                    "detail": null,
                    "placeName": null,
                    "posLat": null,
                    "posLong": null,
                    "zoomLevel": 11,
                    "address": null,
                    "globalAddress": null,
                    "miniMap": null,
                    "isImpLocationGuide": true
                },
                "startDate": null,
                "endDate": null,
                "refundDate": "START_DATE",
                "availableStartDate": null,
                "bookingAvailableCode": "RI01",
                "bookingAvailableValue": 0,
                "bookingConfirmCode": "CF01",
                "bookingTimeUnitCode": "RT02",
                "isPeriodFixed": false,
                "isOnsitePayment": false,
                "isProgramBizItem": false,
                "isClosedBooking": false,
                "isClosedBookingUser": false,
                "isRequestMessageUsed": null,
                "isKopisCouponAvailable": null,
                "isImp": true,
                "rawIsImp": null,
                "inspectionStatusCode": "IS00",
                "minBookingCount": 1,
                "maxBookingCount": 1,
                "minBookingTime": 1,
                "maxBookingTime": 5,
                "extraFeeSettingJson": {},
                "bookableSettingJson": {
                    "isPaused": false,
                    "isUseOpen": true,
                    "openDateTime": "2026-01-20T20:00:00+09:00",
                    "isOpened": true
                },
                "bookingCountSettingJson": {
                    "maxBookingCount": 1,
                    "minBookingCount": 1
                },
                "paymentSettingJson": null,
                "bizItemSubType": null,
                "priceByDates": null,
                "websiteUrl": null,
                "discountCardCode": null,
                "customFormJson": null,
                "optionCategoryMappings": null,
                "bizItemCategoryId": null,
                "additionalPropertyJson": {
                    "ageRatingSetting": null,
                    "openingHoursSetting": null,
                    "runningTime": null,
                    "parkingInfoSetting": null,
                    "ticketingTypeSetting": null,
                    "accommodationAdditionalProperty": null,
                    "arrangementCountSetting": null,
                    "bizItemCategorySpecificSetting": null,
                    "__typename": "AdditionalProperty"
                },
                "bookingCountType": null,
                "isRequiringBookingOption": false,
                "bookingUseGuideJson": [],
                "todayDealRate": null,
                "extraDescJson": [
                    {
                        "title": "쾌적한 24시 실내테니스장이고 위치 일산 중심에 있어요!",
                        "context": "고양ic 나오면 차량 5분 이내거리 입니다!\n대중교통 또한 정류장 바로 뒤라서 도보1분 편하게 오실 수 있습니다!\n프라이빗한 테니스를 즐겨보세요 :)",
                        "externalKey": null,
                        "images": []
                    }
                ],
                "bookingPrecautionJson": [
                    {
                        "title": null,
                        "desc": "1. 이용일 10일 전까지만 무료 취소 가능합니다.\n이후 수수료 발생, 당일 취소 불가 (예약 페이지 수수료 참고)\n\n2. 이용시간 5분전까지는 대기실 및 테니스장 입장 제한해주세요(제발...매너...)\n\n3. 대관 시 안전사고에 대해서 테니스빌리지는 어떠한 책임도 없으므로 이용하는 분들께서 절대 주의바랍니다.\n\n4. 잠겨있는 볼박스 무단 사용 절대금지 합니다(절도신고예정)\n\n5. 라켓과 공은 꼭 본인이 챙겨 오셔야 합니다.\n\n6. 클레이코트에서 신었던 신발은 신지마세요(오염됨)\n\n7. 쓰레기 분리수거 잘해주시고 무단투기는 CCTV 확인 후 신고합니다.\n\n8. 이용 시 끝나기 5분전에는 정리 해주세요(쓰레기정리, 공정리, 의자정리) (이것도 제발...)\n\n9. 밤 10시 이후부터는 주변 주택가 소음이 있음으로 테니스장과 마당에서 고성은 자제 바랍니다.\n\n10. 예약종료 시간을 꼭 지켜주세요\n\n11. 라이트, 에어컨, 선풍기 임의 작동 금지(자동이에요)\n\n12. 코치님들 대관 문의는 따로 연락주시기 바랍니다(협의 되지 않은 자체 레슨 금지!)\n\n13. 다음 달 예약은 매월 20일 20시 오픈 :)",
                        "popupSetting": null,
                        "__typename": "BookingPrecautionJson"
                    }
                ],
                "isSeatUsed": false,
                "isNPayUsed": true,
                "isDeducted": false,
                "isImpStock": true,
                "isGreenTicket": false,
                "orderSettingJson": null,
                "isRobotDeliveryAvailable": null,
                "bizItemAmenityJson": null,
                "resources": [
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20251122_67/17637742872516joiE_JPEG/image.jpg",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230216_155/1676535342360BLVGK_JPEG/image.jpg",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230216_297/16765354902782NpC6_JPEG/image.jpg",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230216_193/16765355052350lA2w_JPEG/image.jpg",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230216_90/1676535523227UJeYP_JPEG/image.jpg",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230817_46/1692255452409BoNVG_JPEG/image.jpg",
                        "__typename": "BizItemResource"
                    }
                ],
                "bizItemResources": [
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20251122_67/17637742872516joiE_JPEG/image.jpg",
                        "bizItemResourceSeq": 1085820174,
                        "bizItemId": "7350361",
                        "order": 0,
                        "resourceTypeCode": "FL00",
                        "regDateTime": "2026-01-11T16:27:18Z",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230216_155/1676535342360BLVGK_JPEG/image.jpg",
                        "bizItemResourceSeq": 1085820175,
                        "bizItemId": "7350361",
                        "order": 0,
                        "resourceTypeCode": "FL01",
                        "regDateTime": "2026-01-11T16:27:18Z",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230216_297/16765354902782NpC6_JPEG/image.jpg",
                        "bizItemResourceSeq": 1085820176,
                        "bizItemId": "7350361",
                        "order": 1,
                        "resourceTypeCode": "FL01",
                        "regDateTime": "2026-01-11T16:27:18Z",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230216_193/16765355052350lA2w_JPEG/image.jpg",
                        "bizItemResourceSeq": 1085820177,
                        "bizItemId": "7350361",
                        "order": 2,
                        "resourceTypeCode": "FL01",
                        "regDateTime": "2026-01-11T16:27:18Z",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230216_90/1676535523227UJeYP_JPEG/image.jpg",
                        "bizItemResourceSeq": 1085820178,
                        "bizItemId": "7350361",
                        "order": 3,
                        "resourceTypeCode": "FL01",
                        "regDateTime": "2026-01-11T16:27:18Z",
                        "__typename": "BizItemResource"
                    },
                    {
                        "resourceUrl": "https://naverbooking-phinf.pstatic.net/20230817_46/1692255452409BoNVG_JPEG/image.jpg",
                        "bizItemResourceSeq": 1085820179,
                        "bizItemId": "7350361",
                        "order": 4,
                        "resourceTypeCode": "FL01",
                        "regDateTime": "2026-01-11T16:27:18Z",
                        "__typename": "BizItemResource"
                    }
                ],
                "minMaxPrice": null,
                "__typename": "BizItem"
            }
        ]
    }
}
 */
