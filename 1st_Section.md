- Big Data??
  - 핫 하지만 대부분 사용하지 않음
  - 왜?
    - EX > 대형 쇼핑몰 추천 알고리즘 제작 -> 실패
    - 수집이 어렵다
    - 정제도 어렵다
    - 저장도 어렵다
    - 쿼리도 어렵다
      - 왜?
    - 툴이 없는 것이 아니다
    - 왜 어려울까?
      - 시스템을 만드는 것 자체가 어렵다.
        - Kafka 를 만들자 -> Cluster 만들자 -> Docker 를 쓰자 -> Scaling 을 하자 -> Monitoring?-> 배포 환경 구축 -> 터지면 데이터 유실은? -> GG
      - 데이터를 모으는 것을 설계가 어렵다.
        - 무엇을 수집하고 어떻게 수집하는가?
        - 얼마나 자주, 얼마나 빨리 접근?
        - Query 가 가능한 일관된 Table Schema
        - 새로운 Form 에대한 확장성
      - Data Architecture 의 정답은 주어진 문제 상황 팀에 따라 다르다.
      - 잡일을 줄이자 !
  - Data science?

# Serverless 로 하는 데이터 수집!

## 데이터 설계

1. 정형화, 일관성
   1. 아니면 Query 시 노답
2. 다양한 형태의 Action Event 를 담아야함
   1. 명시적 / 비명시적 / 직접적 / 간접적
3. Front 에서 이해하기 쉬워야 함

- 데이터를 문장으로 정리
  - ex. 이 _유저가_ _아이폰으로_ _피드에서_ 3 번째에서 _카드를_ _클릭해서_ _10 초_ 동안 봤다 -> 육하원칙이 중요!
- 문장을 JSON 으로 정리 -> JSON schema 설정

```json
{
    user:{
        id
    }
    content:{
        id
    }
    location:"FEED/y=0"
    referral:"CLICK"
    action:{
        type:"READ"
        duration:10
    }
}
```

- 2 번 엎음 ^^
- number 나 Enum 을 설정하지말자 -> 확장성이 떨어짐ㅌ
  - JSON 은 "1200"이나 1200 이나 똑같다
  - String to Number 가 훨~~~씬 안전하다
  - URL 을 활용하면 좋다
    - 생각보다 안정적이다.
    - URL 자체에 정보가 포함된 경우가 많다 -> 우린 ㅠㅠ
    - 대부분의 툴이 url parsing 을 지원합니다.

## 데이터 수집, 정제, 저장

- Best 상황을 먼저 생각합니다.
- user -> api gateway -> Lambda -> Kinesis FireHouse -> S3
- Kenesis FireHouse-> 데이터를 일정기간/크기만큼 저장후 S3 에 저장 !!! - Fully managed data stream
- Kenesis FireHouse-> 알아서 압축해줌 -> JSON 을 gzip 으로 압축 해줌 -> 과금이 줄어 듬

## Data Analytics , Service

- S3 에만 쌓기만 하면 됩니다. -> 가장 안전한 저장소

1. Query 를 하고 싶어요!
   - Athena 를 쓰세요!
2. 유저에 맞게 개인적인 Query
   - Athena 를 쓰서 GroupBygotj s3 에 쓴다
   - 이 파일을 Aurora 로 읽음 -> 빠른 접근이 접근이 가능한 DB 로 옮김
   - Application 으로는 Aurora 로 쿼리
3. 머신러닝 -> 금단의 단어
   - 유저가 Follow 한 기록을 정리 -> s3 로 옮김
   - amazon ML, sageMaker 로 S3 에서 Data 를 읽어 Training
     - ML 은 기능이 얼마 없지만 간단함
     - real-time 키면 매우매우 좋음

## 가격

- 5 KB\*1000 /s -> 1 번당 100G 하루에 100 번 Query -> 달에 1000 달러 !

# 정리

- UX 와 서비스를 개선할려면 Application Layer 를 개선해야합니다.
- Data Pipeline 을 직접 운영하면 굉장히 많은 시간을 구축에 쏟아야합니다.
- 그러니까 serverless 로 만들자!
- Hadoop 이나 Spark 가 꼭 정답이 아니다.

# Q&A

- 실패 경우가 있나요?
  - 아마존 DOWN 이 됩니다. -> ㅜㅜ 방법이 없습니다.
    - 그래서 우리가 아마존 보다 잘 할 수 있냐? -> NO
- metaData 가 변하는 경우는 어떻게 될까요?
  - metaData 를 변하는 것은 어쩔 수 없다.
  - Front 과의 협업이 필수 적이다.
  - JOIN 을 줄어야 합니다.
  - 내부적으로 metaData 를 저장하고 Frontend 와는 문서화하여 관리합니다.
- Athena 파일크기/ 갯수
  - FireHouse 자체에 크기제한이 있습니다.
  - 너무 작은 파일 경우 성능이 떨어짐
- API gateway/lambda 를 쓰지 않으면 안되나요?
  - Client 에 의존하는 경우 악위적인 데이터를 걸러낼 수 없습니다.
  - Android 는 데이터를 변조하기가 쉬워서 걸러내야함
  - 지금은 Kinesis 에 Lambda 를 붙힐 수 있습니다. -> 이러면 APIGATEWAY 가격이 절약
