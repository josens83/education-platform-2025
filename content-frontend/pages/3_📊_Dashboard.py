import streamlit as st
import random
from datetime import datetime, timedelta

st.set_page_config(page_title="대시보드", page_icon="📊", layout="wide")
st.title("📊 성과 대시보드")

# 날짜 필터
col1, col2, col3 = st.columns(3)
with col1:
    st.date_input("시작일", datetime.now() - timedelta(days=7))
with col2:
    st.date_input("종료일", datetime.now())
with col3:
    st.selectbox("캠페인", ["전체", "여름 세일", "신제품"])

st.divider()

# KPI 메트릭
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("총 노출수", "125.3K", "+12.5%")
with col2:
    st.metric("클릭수", "4,235", "+8.3%")
with col3:
    st.metric("CTR", "3.38%", "+0.23%")
with col4:
    st.metric("전환율", "2.1%", "+0.1%")

st.divider()

# 차트
col1, col2 = st.columns(2)

with col1:
    st.subheader("📈 일별 성과")

    # 샘플 데이터
    dates = [(datetime.now() - timedelta(days=i)).strftime("%m/%d") for i in range(7, 0, -1)]
    ctr_data = [3.2 + random.random() for _ in range(7)]

    chart_data = {
        "날짜": dates,
        "CTR(%)": ctr_data
    }
    st.line_chart(data=chart_data, x="날짜", y="CTR(%)")

with col2:
    st.subheader("🎯 세그먼트별 성과")

    segment_data = {
        "세그먼트": ["20대", "30대", "40대"],
        "CTR": [3.8, 3.2, 2.9],
        "전환율": [2.5, 2.2, 1.9]
    }
    st.bar_chart(data=segment_data, x="세그먼트", y=["CTR", "전환율"])

# 상위 콘텐츠
st.divider()
st.subheader("🏆 상위 성과 콘텐츠")

top_content = [
    {"순위": 1, "캠페인": "여름 세일", "CTR": "4.2%", "전환": 125},
    {"순위": 2, "캠페인": "신제품", "CTR": "3.9%", "전환": 98},
    {"순위": 3, "캠페인": "브랜드", "CTR": "3.5%", "전환": 76}
]

st.table(top_content)

# AI 인사이트
st.divider()
st.subheader("🤖 AI 인사이트")
st.info("""
**주요 발견사항:**
1. 20대 세그먼트의 CTR이 가장 높음 (3.8%)
2. 오전 10-11시 게시 콘텐츠의 성과가 가장 좋음
3. 이모지 포함 헤드라인이 15% 높은 참여율 기록

**추천 액션:**
- 20대 타겟 콘텐츠에 예산 증대
- 오전 10시 전후로 주요 콘텐츠 게시
""")
