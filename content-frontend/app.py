import streamlit as st
import requests

# 페이지 설정
st.set_page_config(
    page_title="Artify Content Platform",
    page_icon="🎨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 타이틀
st.title("🎨 Artify Content Platform")
st.markdown("### AI 기반 마케팅 콘텐츠 생성 및 분석")

# 사이드바
with st.sidebar:
    st.image("https://via.placeholder.com/300x100/667eea/ffffff?text=Artify", use_column_width=True)
    st.markdown("---")
    st.markdown("### 빠른 시작")
    st.markdown("""
    1. **🎯 Segments**: 타겟 고객 정의
    2. **🎨 Generate**: AI 콘텐츠 생성
    3. **📊 Analytics**: 성과 분석
    """)
    st.markdown("---")

    # API 상태 체크
    api_url = "https://artify-content-api.onrender.com"
    try:
        response = requests.get(f"{api_url}/health", timeout=5)
        if response.status_code == 200:
            st.success("✅ API 연결됨")
        else:
            st.error("❌ API 오프라인")
    except:
        st.warning("⚠️ API 연결 중...")

# 메인 화면
col1, col2, col3 = st.columns(3)

with col1:
    st.info("### 🎯 세그먼트 관리")
    st.metric("등록된 세그먼트", "0개")
    if st.button("세그먼트 생성", use_container_width=True):
        st.switch_page("pages/1_🎯_Segments.py")

with col2:
    st.success("### 🎨 콘텐츠 생성")
    st.metric("생성된 콘텐츠", "0개")
    if st.button("콘텐츠 생성", use_container_width=True):
        st.switch_page("pages/2_🎨_Generate.py")

with col3:
    st.warning("### 📊 성과 분석")
    st.metric("평균 CTR", "0%")
    if st.button("분석 보기", use_container_width=True):
        st.switch_page("pages/3_📊_Analytics.py")

# 최근 활동
st.markdown("---")
st.subheader("📈 최근 생성 콘텐츠")

# 샘플 데이터
sample_data = [
    {"id": 1, "캠페인": "여름 세일", "세그먼트": "20대 여성", "CTR": "3.2%"},
    {"id": 2, "캠페인": "신제품 출시", "세그먼트": "30대 남성", "CTR": "2.8%"},
]

st.dataframe(sample_data, use_container_width=True)
