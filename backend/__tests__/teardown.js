/**
 * Jest Global Teardown
 *
 * 모든 테스트 실행 후에 한 번 실행됩니다.
 */

module.exports = async () => {
  console.log('\n🧹 Cleaning up test environment...\n');

  // 필요한 경우 추가 정리 작업 수행
  // 예: 테스트 데이터베이스 정리, 임시 파일 삭제 등

  console.log('✅ Test cleanup completed\n');
};
