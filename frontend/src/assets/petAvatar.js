export function getPetAvatar(species) {
  // 외부 SVG를 다시 참조한 래퍼는 <img> 안에서 렌더링이 막힐 수 있어,
  // 사용자가 전달한 원본 SVG를 직접 사용한다.
  // 전달 이미지의 실제 종과 임시 파일명이 반대로 저장되어 있어 매핑을 바로잡는다.
  return species === 'dog' ? '/pet-cat-source.svg' : '/pet-dog-source.svg'
}

export function getPetAvatarLabel(species) {
  return species === 'dog' ? '강아지 기본 아바타' : '고양이 기본 아바타'
}
