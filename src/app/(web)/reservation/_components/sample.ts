fetch('https://m.booking.naver.com/graphql?opName=hourlySchedule', {
  headers: {
    'content-type': 'application/json',
  },
  body: '{"operationName":"hourlySchedule","variables":{"scheduleParams":{"businessTypeId":10,"businessId":"767366","bizItemId":"7350361","startDateTime":"2026-02-01T00:00:00","endDateTime":"2026-02-28T23:59:59","fixedTime":true,"includesHolidaySchedules":true}},"query":"query hourlySchedule($scheduleParams: ScheduleParams) {\\n  schedule(input: $scheduleParams) {\\n    bizItemSchedule {\\n      hourly {\\n        id\\n        name\\n        slotId\\n        scheduleId\\n        detailScheduleId\\n        unitStartDateTime\\n        unitStartTime\\n        unitBookingCount\\n        unitStock\\n        bookingCount\\n        stock\\n        isBusinessDay\\n        isSaleDay\\n        isUnitSaleDay\\n        isUnitBusinessDay\\n        isHoliday\\n        duration\\n        desc\\n        minBookingCount\\n        maxBookingCount\\n        saleStartDateTime\\n        saleEndDateTime\\n        seatGroups {\\n          color\\n          maxPrice\\n          name\\n          remainStock\\n          __typename\\n        }\\n        prices {\\n          groupName\\n          isDefault\\n          price\\n          priceId\\n          scheduleId\\n          priceTypeCode\\n          name\\n          normalPrice\\n          desc\\n          order\\n          groupOrder\\n          slotId\\n          agencyKey\\n          bookingCount\\n          isImp\\n          saleStartDateTime\\n          saleEndDateTime\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}"}',
  method: 'POST',
})

/* response sample */
/*
 {
    "id": "7350361_null_null_2026-02-15T19:00:00+09:00",
    "name": null,
    "slotId": null,
    "scheduleId": null,
    "detailScheduleId": null,
    "unitStartDateTime": "2026-02-15T10:00:00Z",
    "unitStartTime": "2026-02-15 19:00:00",
    "unitBookingCount": 0,
    "unitStock": 1,
    "bookingCount": 0,
    "stock": null,
    "isBusinessDay": true,
    "isSaleDay": true,
    "isUnitSaleDay": true,
    "isUnitBusinessDay": true,
    "isHoliday": false,
    "duration": 60,
    "desc": null,
    "minBookingCount": 1,
    "maxBookingCount": 1,
    "saleStartDateTime": null,
    "saleEndDateTime": null,
    "seatGroups": [],
    "prices": [
        {
            "groupName": null,
            "isDefault": false,
            "price": 38500,
            "priceId": null,
            "scheduleId": null,
            "priceTypeCode": null,
            "name": null,
            "normalPrice": null,
            "desc": null,
            "order": null,
            "groupOrder": null,
            "slotId": null,
            "agencyKey": null,
            "bookingCount": null,
            "isImp": null,
            "saleStartDateTime": null,
            "saleEndDateTime": null,
            "__typename": "Price"
        }
    ],
    "__typename": "HourlySchedule"
}
*/
