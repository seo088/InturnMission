import { useState, useEffect, useRef, useCallback } from "react";

// ─── 전체 116건 질병 데이터 (CSV: 동물질병정보2015_2.csv) ─────────────────────
const ALL_DISEASES = [
  {id:"d28",nm:"돼지단독",eng:"Swine erysipelas",animal:"돼지",cause:"세균"},
  {id:"d29",nm:"돼지로타바이러스감염증",eng:"Porcine rotavirus infection",animal:"돼지",cause:"바이러스"},
  {id:"d30",nm:"돼지생식기호흡기증후군",eng:"PRRS",animal:"돼지",cause:"바이러스"},
  {id:"d31",nm:"돼지수포병",eng:"Swine vesicular disease",animal:"돼지",cause:"기타"},
  {id:"d32",nm:"돼지써코바이러스감염증",eng:"PCV-2 infection",animal:"돼지",cause:"바이러스"},
  {id:"d33",nm:"돼지유행성설사병",eng:"Porcine epidemic diarrhea",animal:"돼지",cause:"바이러스"},
  {id:"d34",nm:"돼지적리",eng:"Swine dysentery",animal:"돼지",cause:"세균"},
  {id:"d35",nm:"돼지열병",eng:"Classical swine fever",animal:"돼지",cause:"바이러스"},
  {id:"d36",nm:"돼지파보바이러스감염증",eng:"Porcine parvovirus infection",animal:"돼지",cause:"기타"},
  {id:"d37",nm:"돼지호흡기코로나바이러스감염증",eng:"Porcine respiratory coronaviral",animal:"돼지",cause:"바이러스"},
  {id:"d38",nm:"흉막폐렴",eng:"Pleuropneumonia of pigs",animal:"돼지",cause:"세균"},
  {id:"d39",nm:"럼피스킨병",eng:"Lumpy skin disease",animal:"소",cause:"기타"},
  {id:"d40",nm:"레오바이러스감염증",eng:"Reovirus infection",animal:"소/닭/돼지",cause:"기타"},
  {id:"d41",nm:"렙토스피라병",eng:"Leptospirosis",animal:"소",cause:"세균"},
  {id:"d42",nm:"리스테리아병",eng:"Listeriosis",animal:"개/소/닭",cause:"세균"},
  {id:"d43",nm:"리프트계곡열",eng:"Rift valley fever",animal:"소/면양",cause:"기타"},
  {id:"d44",nm:"마렉병",eng:"Marek's disease",animal:"닭",cause:"기타"},
  {id:"d45",nm:"닭마이코플라즈마병",eng:"Avian mycoplasmosis",animal:"닭",cause:"기타"},
  {id:"d46",nm:"마이코플라즈마폐렴",eng:"Mycoplasmal pneumonia",animal:"소/돼지",cause:"세균"},
  {id:"d47",nm:"말바이러스성동맥염",eng:"Equine viral arteritis",animal:"말",cause:"바이러스"},
  {id:"d48",nm:"말비저",eng:"Glanders",animal:"말",cause:"기타"},
  {id:"d49",nm:"말선역",eng:"Strangles",animal:"말",cause:"기타"},
  {id:"d50",nm:"말전염성빈혈",eng:"Equine infectious anemia",animal:"말",cause:"기타"},
  {id:"d51",nm:"밍크바이러스성장염",eng:"Mink viral enteritis",animal:"밍크",cause:"기타"},
  {id:"d52",nm:"밍크알류샨병",eng:"Aleutian disease in mink",animal:"밍크",cause:"기타"},
  {id:"d53",nm:"보툴리즘",eng:"Clostridium botulinum",animal:"소/돼지",cause:"세균"},
  {id:"d54",nm:"봉입체성간염",eng:"Inclusion body hepatitis",animal:"닭",cause:"기타"},
  {id:"d55",nm:"브루셀라병",eng:"Brucellosis",animal:"소/개/돼지",cause:"세균"},
  {id:"d56",nm:"부저병",eng:"American foulbrood disease",animal:"꿀벌",cause:"기타"},
  {id:"d57",nm:"블루텅",eng:"Bluetongue",animal:"소/면양",cause:"바이러스"},
  {id:"d58",nm:"사슴만성소모성질병",eng:"Chronic wasting disease",animal:"사슴",cause:"기타"},
  {id:"d59",nm:"살모넬라균증",eng:"Salmonellosis",animal:"소/돼지",cause:"세균"},
  {id:"d60",nm:"선모충증",eng:"Trichinosis",animal:"돼지",cause:"기생충"},
  {id:"d61",nm:"소결핵병",eng:"Tuberculosis",animal:"소/개/고양이",cause:"세균"},
  {id:"d62",nm:"소로타바이러스감염증",eng:"Bovine rotavirus infection",animal:"소",cause:"바이러스"},
  {id:"d63",nm:"소바베시아병",eng:"Babesiosis",animal:"소",cause:"기생충"},
  {id:"d64",nm:"소바이러스성설사",eng:"Bovine viral diarrhea",animal:"소",cause:"기타"},
  {id:"d65",nm:"소백혈병",eng:"Bovine leukemia",animal:"소",cause:"바이러스"},
  {id:"d66",nm:"소아데노바이러스감염증",eng:"Adenovirus infection",animal:"소",cause:"기타"},
  {id:"d67",nm:"소유행열",eng:"Bovine ephemeral fever",animal:"소",cause:"기타"},
  {id:"d68",nm:"소전염성비기관염",eng:"IBR",animal:"소",cause:"기타"},
  {id:"d69",nm:"소츄잔병",eng:"Chuzan disease",animal:"소",cause:"기타"},
  {id:"d70",nm:"소캄필로박터증",eng:"Genital Campylobacteriosis",animal:"소",cause:"기생충"},
  {id:"d71",nm:"소콕시듐증",eng:"Coccidiosis (bovine)",animal:"소",cause:"기타"},
  {id:"d73",nm:"소RS바이러스병",eng:"Bovine RSV infection",animal:"소",cause:"기타"},
  {id:"d74",nm:"수포성구내염",eng:"Vesicular stomatitis",animal:"소/돼지",cause:"바이러스"},
  {id:"d75",nm:"스피로헤타증",eng:"Spirochetosis",animal:"닭",cause:"바이러스"},
  {id:"d76",nm:"소아까바네병",eng:"Akabane disease",animal:"소",cause:"기타"},
  {id:"d77",nm:"아나플라즈마병",eng:"Anaplasmasis",animal:"소",cause:"기생충"},
  {id:"d78",nm:"아이노바이러스감염증",eng:"Aino virus infection",animal:"소",cause:"바이러스"},
  {id:"d79",nm:"아프리카돼지열병",eng:"African swine fever",animal:"돼지",cause:"바이러스"},
  {id:"d80",nm:"아프리카마역",eng:"African horse sickness",animal:"말",cause:"기타"},
  {id:"d81",nm:"에드워드병",eng:"Edwardsiellosis",animal:"어류",cause:"기타"},
  {id:"d82",nm:"에로모나스증",eng:"Aeromonas infection",animal:"어류",cause:"기타"},
  {id:"d83",nm:"에페리스로조아병",eng:"Eperythrozoonosis",animal:"소/돼지",cause:"기타"},
  {id:"d84",nm:"연쇄상구균감염증",eng:"Streptococcosis",animal:"돼지",cause:"세균"},
  {id:"d85",nm:"오리바이러스성간염",eng:"Duck hepatitis",animal:"오리",cause:"바이러스"},
  {id:"d86",nm:"오리패혈증",eng:"Remerella infection",animal:"오리",cause:"기타"},
  {id:"d87",nm:"오제스키병",eng:"Aujeszky's disease",animal:"돼지",cause:"기타"},
  {id:"d88",nm:"요네병",eng:"Johne's disease",animal:"소/돼지",cause:"기타"},
  {id:"d89",nm:"우역",eng:"Rinderpest",animal:"소",cause:"바이러스"},
  {id:"d90",nm:"우폐역",eng:"CBPP",animal:"소",cause:"기타"},
  {id:"d91",nm:"웨스트나일열",eng:"West nile fever",animal:"개/고양이/소",cause:"기타"},
  {id:"d92",nm:"위축성비염",eng:"Atrophic rhinitis",animal:"돼지",cause:"세균"},
  {id:"d93",nm:"유방염",eng:"Mastitis",animal:"소",cause:"기타"},
  {id:"d94",nm:"이바라기병",eng:"Ibaraki disease",animal:"소",cause:"바이러스"},
  {id:"d95",nm:"돼지일본뇌염",eng:"Japanese B Encephalitis",animal:"돼지",cause:"바이러스"},
  {id:"d96",nm:"장독혈증",eng:"Enterotoxemia",animal:"소/돼지/면양",cause:"세균"},
  {id:"d97",nm:"전염성기관지염",eng:"Infectious bronchitis",animal:"닭",cause:"기타"},
  {id:"d98",nm:"전염성비염",eng:"Snuffles",animal:"토끼",cause:"세균"},
  {id:"d99",nm:"돼지전염성위장염",eng:"TGE",animal:"돼지",cause:"기타"},
  {id:"d100",nm:"전염성후두기관염",eng:"Infectious laryngotracheitis",animal:"조류",cause:"기타"},
  {id:"d101",nm:"전염성F낭병",eng:"Infectious bursal disease",animal:"닭",cause:"기타"},
  {id:"d102",nm:"닭백혈병",eng:"Lymphoid Leukosis",animal:"닭",cause:"바이러스"},
  {id:"d103",nm:"저병원성조류인플루엔자",eng:"Low-path avian influenza",animal:"조류",cause:"기타"},
  {id:"d104",nm:"지간부란",eng:"Foot Rot",animal:"소",cause:"세균"},
  {id:"d105",nm:"추백리",eng:"Pullorum disease",animal:"닭",cause:"기타"},
  {id:"d106",nm:"칸디다증",eng:"Candidiasis",animal:"닭",cause:"곰팡이"},
  {id:"d107",nm:"큐열",eng:"Q fever",animal:"소/개/고양이",cause:"세균"},
  {id:"d109",nm:"크립토스포리디움증",eng:"Cryptosporidiosis",animal:"개/고양이/소",cause:"기타"},
  {id:"d110",nm:"클라미디아병",eng:"Chlamydiosis",animal:"소/조류/돼지",cause:"세균"},
  {id:"d112",nm:"탄저",eng:"Anthrax",animal:"소/돼지",cause:"세균"},
  {id:"d113",nm:"토끼바이러스성출혈병",eng:"Viral haemorrhagic fever",animal:"토끼",cause:"기타"},
  {id:"d115",nm:"개코로나바이러스감염증",eng:"Canine coronavirus infection",animal:"개",cause:"바이러스"},
  {id:"d116",nm:"소부제병",eng:"Foot rot (bovine)",animal:"소",cause:"세균"},
  {id:"d117",nm:"파스튜렐라폐렴",eng:"Pasteurella Pneumonia",animal:"돼지",cause:"세균"},
  {id:"d118",nm:"스크래피",eng:"Scrapie",animal:"면양",cause:"기타"},
  {id:"d119",nm:"류코사이토준병",eng:"Leucocytozoonosis",animal:"닭/오리",cause:"기생충"},
  {id:"d120",nm:"소해면상뇌증",eng:"BSE",animal:"소",cause:"기타"},
  {id:"d121",nm:"타이레리아",eng:"Theilerosis",animal:"소",cause:"기생충"},
  {id:"d1",nm:"가금티푸스",eng:"Fowl typhoid",animal:"닭",cause:"세균"},
  {id:"d2",nm:"가성우역",eng:"PPR",animal:"소/면양",cause:"바이러스"},
  {id:"d3",nm:"가금콜레라",eng:"Fowl cholera",animal:"닭/오리",cause:"세균"},
  {id:"d4",nm:"간질증",eng:"Fascioliasis",animal:"면양",cause:"기생충"},
  {id:"d5",nm:"개디스템퍼",eng:"Canine distemper",animal:"개",cause:"바이러스"},
  {id:"d6",nm:"개보데텔라폐렴",eng:"Pneumonic bordetellosis",animal:"개",cause:"세균"},
  {id:"d7",nm:"개선충증",eng:"Mange",animal:"개/돼지",cause:"기생충"},
  {id:"d8",nm:"개파보바이러스감염증",eng:"Canine parvovirus infection",animal:"개",cause:"바이러스"},
  {id:"d9",nm:"계두",eng:"Fowl pox",animal:"닭",cause:"기타"},
  {id:"d11",nm:"곰팡이성폐렴",eng:"Aspergillosis",animal:"닭",cause:"곰팡이"},
  {id:"d12",nm:"광견병",eng:"Rabies",animal:"개/고양이/소",cause:"바이러스"},
  {id:"d13",nm:"구제역",eng:"Foot and mouth disease",animal:"소/돼지/면양",cause:"바이러스"},
  {id:"d14",nm:"글래서씨병",eng:"Glasser's disease",animal:"돼지",cause:"세균"},
  {id:"d15",nm:"기종저",eng:"Blackleg",animal:"소/면양",cause:"기타"},
  {id:"d16",nm:"꿀벌백묵병",eng:"Chalkbrood disease",animal:"꿀벌",cause:"곰팡이"},
  {id:"d17",nm:"낭미충증",eng:"Cysticercosis",animal:"돼지",cause:"기타"},
  {id:"d18",nm:"네오스포라병",eng:"Neosporosis",animal:"소/개",cause:"기생충"},
  {id:"d19",nm:"노제마병",eng:"Nosema disease",animal:"꿀벌",cause:"기타"},
  {id:"d20",nm:"뇌척수염",eng:"Avian encephalomyelitis",animal:"닭",cause:"바이러스"},
  {id:"d21",nm:"뉴캣슬병",eng:"Newcastle disease",animal:"닭",cause:"기타"},
  {id:"d22",nm:"니파바이러스감염증",eng:"Nipahvirus infection",animal:"개/고양이/돼지",cause:"기타"},
  {id:"d23",nm:"닭세망내피증",eng:"Reticuloendotheliosis",animal:"닭/오리",cause:"바이러스"},
  {id:"d24",nm:"닭콕시듐증",eng:"Coccidiosis (poultry)",animal:"닭",cause:"기타"},
  {id:"d25",nm:"대장균증",eng:"Colibacillosis",animal:"소/돼지",cause:"세균"},
  {id:"d26",nm:"돼지게타바이러스감염증",eng:"Porcine getahvirus disease",animal:"돼지",cause:"바이러스"},
  {id:"d27",nm:"돼지뇌심근염",eng:"Encephalomyocarditis",animal:"돼지",cause:"바이러스"},
];

// ─── API 소스 노드 ────────────────────────────────────────────────────────────
const API_NODES = [
  {id:"api1",label:"동물병원 조회서비스",provider:"행정안전부",apiType:"facility"},
  {id:"api2",label:"동물약국 조회서비스",provider:"행정안전부",apiType:"facility"},
  {id:"api3",label:"동물미용업 조회서비스",provider:"행정안전부",apiType:"facility"},
  {id:"api4",label:"동물위탁관리업 조회서비스",provider:"행정안전부",apiType:"facility"},
  {id:"api5",label:"동물장묘업 조회서비스",provider:"행정안전부",apiType:"facility"},
  {id:"api6",label:"반려동물동반문화시설",provider:"한국문화정보원",apiType:"place"},
  {id:"api7",label:"반려동물동반여행서비스",provider:"한국관광공사",apiType:"place"},
  {id:"api8",label:"휴게소반려동물편의시설",provider:"한국도로공사",apiType:"place"},
  {id:"api9",label:"구조동물 조회서비스",provider:"농림축산검역본부",apiType:"animal"},
  {id:"api10",label:"분실동물 조회서비스",provider:"농림축산검역본부",apiType:"animal"},
  {id:"api11",label:"동물보호센터 정보조회",provider:"농림축산식품부",apiType:"animal"},
  {id:"api12",label:"동물질병정보",provider:"농림축산검역본부",apiType:"medical"},
  {id:"api13",label:"동물질병 증상분류",provider:"KISTI",apiType:"medical"},
  {id:"api14",label:"입양정보 서비스",provider:"공공데이터포털",apiType:"animal"},
];

// ─── 증상 분류 (KISTI) ───────────────────────────────────────────────────────
const SYMPTOM_CATS = [
  {id:"sym1",label:"소화기계 증상"},{id:"sym2",label:"호흡기계 증상"},
  {id:"sym3",label:"피부계 증상"}, {id:"sym4",label:"신경계 증상"},
  {id:"sym5",label:"근골격계 증상"},{id:"sym6",label:"생식기계 증상"},
  {id:"sym7",label:"혈액·면역계 증상"},{id:"sym8",label:"안과계 증상"},
];

// ─── 동물 종 노드 ─────────────────────────────────────────────────────────────
const ANIMAL_NODES = [
  {id:"an1",label:"개 (Canis lupus familiaris)"},
  {id:"an2",label:"고양이 (Felis catus)"},
  {id:"an3",label:"소 (Bos taurus)"},
  {id:"an4",nm:"돼지",label:"돼지 (Sus scrofa)"},
  {id:"an5",label:"닭 (Gallus gallus)"},
  {id:"an6",label:"오리 / 조류"},
  {id:"an7",label:"말 (Equus caballus)"},
  {id:"an8",label:"기타 (어류·밍크·꿀벌·면양)"},
];

// ─── 원인 분류 노드 ───────────────────────────────────────────────────────────
const CAUSE_NODES = [
  {id:"cv",label:"바이러스 (Virus)",   color:"#dc2626"},
  {id:"cb",label:"세균 (Bacteria)",    color:"#ea580c"},
  {id:"cp",label:"기생충 (Parasite)",  color:"#16a34a"},
  {id:"cf",label:"곰팡이 (Fungi)",     color:"#7c3aed"},
  {id:"co",label:"기타 (Other)",       color:"#64748b"},
];
const CAUSE_ID = {"바이러스":"cv","세균":"cb","기생충":"cp","곰팡이":"cf","기타":"co"};

const animalKey = (a) => {
  if (a.includes("개")) return "an1";
  if (a.includes("고양이")) return "an2";
  if (a.includes("소")) return "an3";
  if (a.includes("돼지")) return "an4";
  if (a.includes("닭")) return "an5";
  if (a.includes("오리")||a.includes("조류")) return "an6";
  if (a.includes("말")) return "an7";
  return "an8";
};

// ─── 색상 팔레트 (라이트 테마) ────────────────────────────────────────────────
const C = {
  bg:        "#f8fafc",
  panel:     "#ffffff",
  border:    "#e2e8f0",
  root:      "#0f172a",
  eFac:      "#0369a1",
  eMed:      "#be123c",
  eAni:      "#15803d",
  eReg:      "#6d28d9",
  apiFac:    "#0284c7",
  apiMed:    "#e11d48",
  apiAni:    "#16a34a",
  apiPl:     "#7c3aed",
  symColor:  "#b45309",
  aniColor:  "#0f766e",
  dVirus:    "#dc2626",
  dBact:     "#ea580c",
  dPara:     "#16a34a",
  dFungi:    "#7c3aed",
  dOther:    "#475569",
  edgeNorm:  "rgba(100,116,139,0.15)",
  edgeHigh:  "rgba(14,165,233,0.7)",
  edgeDim:   "rgba(100,116,139,0.04)",
  txt:       "#0f172a",
  txts:      "#334155",
  txtm:      "#64748b",
};
const CAUSE_CLR = (c) => ({바이러스:C.dVirus,세균:C.dBact,기생충:C.dPara,곰팡이:C.dFungi}[c]||C.dOther);
const API_CLR   = (t) => ({facility:C.apiFac,medical:C.apiMed,animal:C.apiAni,place:C.apiPl}[t]||C.txtm);

export default function KnowledgeGraphPage() {
  const canvasRef   = useRef(null);
  const animRef     = useRef(null);
  const nodesRef    = useRef([]);
  const edgesRef    = useRef([]);
  const mouseRef    = useRef({drag:null,pan:false});
  const transformRef= useRef({x:0,y:0,scale:0.72});
  const initRef     = useRef({x:0,y:0,scale:0.72});
  const frameRef    = useRef(0);
  const connRef     = useRef(new Set());

  const [hoverId,   setHoverId]   = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [stats,     setStats]     = useState({nodes:0,edges:0});
  const [filterMode,setFilterMode]= useState("all");

  // ── Connected set 계산 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!hoverId) { connRef.current = new Set(); return; }
    const s = new Set([hoverId]);
    edgesRef.current.forEach(e => {
      if (e.s===hoverId) s.add(e.t);
      if (e.t===hoverId) s.add(e.s);
    });
    connRef.current = s;
  }, [hoverId]);

  // ── Build graph ────────────────────────────────────────────────────────────
  const buildGraph = useCallback((W, H) => {
    const cx=W/2, cy=H/2;
    const nodes=[], edges=[];
    const push = n => nodes.push(n);
    const link = (s,t,w=0.12) => edges.push({s,t,w});

    // ① Root
    push({id:"root",x:cx,y:cy,vx:0,vy:0,r:34,label:"ex:PetGraph",
      sublabel:"반려동물 지식그래프",color:C.root,type:"root",fixed:true});

    // ② 4 Entity 허브
    const ENTS = [
      {id:"e_fac",label:"ex:Facility",sub:"시설 정보",color:C.eFac,  a:-Math.PI/2},
      {id:"e_med",label:"ex:Medical", sub:"의료 정보",color:C.eMed,  a:0},
      {id:"e_ani",label:"ex:Animal",  sub:"동물 개체",color:C.eAni,  a:Math.PI/2},
      {id:"e_reg",label:"ex:Region",  sub:"지역 정보",color:C.eReg,  a:Math.PI},
    ];
    ENTS.forEach(e => {
      const R=155;
      push({...e,x:cx+Math.cos(e.a)*R,y:cy+Math.sin(e.a)*R,vx:0,vy:0,r:26,type:"entity",
        fx:cx+Math.cos(e.a)*R,fy:cy+Math.sin(e.a)*R});
      link("root",e.id,0.28);
    });

    // ③ 원인 분류 노드 (under e_med)
    CAUSE_NODES.forEach((c,i) => {
      const angle = 0 + (i-2)*0.45;
      const R = 290;
      push({id:c.id,x:cx+Math.cos(angle)*R,y:cy+Math.sin(angle)*R+40,
        vx:0,vy:0,r:20,label:c.label,color:c.color,type:"cause"});
      link("e_med",c.id,0.15);
    });

    // ④ 증상 분류 (KISTI)
    SYMPTOM_CATS.forEach((s,i) => {
      const angle=(i/SYMPTOM_CATS.length)*Math.PI*2+0.6;
      const R=310+(i%2)*22;
      push({id:s.id,x:cx+Math.cos(angle)*R,y:cy+Math.sin(angle)*R,
        vx:0,vy:0,r:15,label:s.label,color:C.symColor,type:"symptom"});
      link("e_med",s.id,0.1);
    });

    // ⑤ 동물 종 노드
    ANIMAL_NODES.forEach((a,i) => {
      const angle=Math.PI/2+(i/ANIMAL_NODES.length)*Math.PI*2*0.7-Math.PI*0.35;
      const R=285+(i%2)*22;
      push({id:a.id,x:cx+Math.cos(angle)*R,y:cy+Math.sin(angle)*R,
        vx:0,vy:0,r:17,label:a.label,color:C.aniColor,type:"animal"});
      link("e_ani",a.id,0.12);
    });

    // ⑥ API 소스 노드
    const grp={facility:[],place:[],animal:[],medical:[]};
    API_NODES.forEach(a=>grp[a.apiType].push(a));
    const etgt={facility:"e_fac",place:"e_reg",animal:"e_ani",medical:"e_med"};
    const ebase={facility:-Math.PI/2,place:Math.PI,animal:Math.PI/2+0.1,medical:0.1};

    Object.entries(grp).forEach(([type,apis])=>{
      apis.forEach((a,i)=>{
        const spread=0.6,base=ebase[type];
        const angle=base+(i-(apis.length-1)/2)*(spread/Math.max(apis.length-1,1));
        const R=380+(i%3)*22;
        push({id:a.id,x:cx+Math.cos(angle)*R,y:cy+Math.sin(angle)*R,
          vx:0,vy:0,r:16,label:a.label,sublabel:a.provider,
          color:API_CLR(type),type:"api",apiType:type});
        link(etgt[type],a.id,0.1);
      });
    });

    // ⑦ 질병 노드 — 116건 전체
    ALL_DISEASES.forEach((d,i)=>{
      const angle=(i/ALL_DISEASES.length)*Math.PI*2;
      const R=500+(i%6)*16;
      push({id:d.id,x:cx+Math.cos(angle)*R,y:cy+Math.sin(angle)*R,
        vx:0,vy:0,r:10,label:d.nm,sublabel:d.eng,
        animal:d.animal,cause:d.cause,color:CAUSE_CLR(d.cause),type:"disease"});
      const cn=CAUSE_ID[d.cause];
      if(cn) link(cn,d.id,0.07);
      link(animalKey(d.animal),d.id,0.04);
      link("api12",d.id,0.03);
    });

    nodesRef.current=nodes;
    edgesRef.current=edges;
    setStats({nodes:nodes.length,edges:edges.length});

    // 초기 transform 저장
    const init={x:0,y:0,scale:0.72};
    transformRef.current={...init};
    initRef.current={...init};
    frameRef.current=0;
  }, []);

  // ── Physics ────────────────────────────────────────────────────────────────
  const simulate = useCallback(()=>{
    const ns=nodesRef.current,es=edgesRef.current;
    const map={};ns.forEach(n=>map[n.id]=n);
    const REPEL=20000, DAMP=0.86;

    for(let i=0;i<ns.length;i++){
      for(let j=i+1;j<ns.length;j++){
        const a=ns[i],b=ns[j];
        if(a.fixed&&b.fixed)continue;
        const dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy+1;
        const dist=Math.sqrt(d2);
        const f=REPEL/d2;
        const fx=dx/dist*f,fy=dy/dist*f;
        if(!a.fixed){a.vx-=fx;a.vy-=fy;}
        if(!b.fixed){b.vx+=fx;b.vy+=fy;}
      }
    }
    es.forEach(e=>{
      const a=map[e.s],b=map[e.t];if(!a||!b)return;
      const dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy)+1;
      const tgt=(a.r+b.r)*4.6;
      const f=(dist-tgt)*(e.w||0.1);
      const fx=dx/dist*f,fy=dy/dist*f;
      if(!a.fixed){a.vx+=fx;a.vy+=fy;}
      if(!b.fixed){b.vx-=fx;b.vy-=fy;}
    });
    const W=canvasRef.current?.width||1200,H=canvasRef.current?.height||700;
    ns.forEach(n=>{
      if(n.fixed)return;
      n.vx+=(W/2-n.x)*0.0015;n.vy+=(H/2-n.y)*0.0015;
      n.vx*=DAMP;n.vy*=DAMP;n.x+=n.vx;n.y+=n.vy;
    });
  },[]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const render = useCallback(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const {x:tx,y:ty,scale}=transformRef.current;
    const W=canvas.width,H=canvas.height;
    const hid=hoverId;
    const conn=connRef.current;
    const hasHov=hid!==null;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);

    // dot grid (canvas space, not world space)
    ctx.fillStyle="rgba(148,163,184,0.22)";
    const step=36;
    for(let gx=0;gx<W;gx+=step)for(let gy=0;gy<H;gy+=step){
      ctx.beginPath();ctx.arc(gx,gy,1,0,Math.PI*2);ctx.fill();
    }

    ctx.save();
    ctx.translate(tx,ty);ctx.scale(scale,scale);
    const map={};nodesRef.current.forEach(n=>map[n.id]=n);

    // ── Edges ──
    edgesRef.current.forEach(e=>{
      const a=map[e.s],b=map[e.t];if(!a||!b)return;
      const show=filterMode==="all"
        ||(filterMode==="disease"&&(a.type==="disease"||b.type==="disease"))
        ||(filterMode==="api"   &&(a.type==="api"    ||b.type==="api"))
        ||(filterMode==="cause" &&(a.type==="cause"  ||b.type==="cause"))
        ||(filterMode==="animal"&&(a.type==="animal" ||b.type==="animal"));
      if(!show)return;

      const isHigh=hasHov&&conn.has(a.id)&&conn.has(b.id);
      const isDim =hasHov&&!isHigh;

      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      if(isHigh){ctx.strokeStyle=C.edgeHigh;ctx.lineWidth=2;}
      else if(isDim){ctx.strokeStyle=C.edgeDim;ctx.lineWidth=0.5;}
      else{ctx.strokeStyle=C.edgeNorm;ctx.lineWidth=0.8;}
      ctx.stroke();
    });

    // ── Nodes ──
    nodesRef.current.forEach(n=>{
      const show=filterMode==="all"
        ||(filterMode==="disease"&&["disease","cause","entity","root"].includes(n.type))
        ||(filterMode==="api"   &&["api","entity","root"].includes(n.type))
        ||(filterMode==="cause" &&["cause","disease","entity","root"].includes(n.type))
        ||(filterMode==="animal"&&["animal","entity","root"].includes(n.type));
      if(!show)return;

      const isHov=n.id===hid;
      const isSel=selected?.id===n.id;
      const isDim=hasHov&&!conn.has(n.id);
      const r=n.r*(isHov?1.22:1);

      ctx.save();
      ctx.globalAlpha=isDim?0.14:1;

      // Fill
      ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
      if(n.type==="root"){
        ctx.fillStyle=C.root;
      } else if(n.type==="entity"){
        ctx.fillStyle=n.color+"18";
      } else {
        ctx.fillStyle="#ffffff";
      }
      ctx.fill();

      // Stroke
      ctx.strokeStyle=(isHov||isSel)?n.color:(n.color+(n.type==="disease"?"66":"88"));
      ctx.lineWidth=(isHov||isSel)?2:1;
      ctx.stroke();

      // Color indicator dot (non-root non-entity)
      if(!["root","entity"].includes(n.type)){
        ctx.beginPath();ctx.arc(n.x,n.y,r*0.32,0,Math.PI*2);
        ctx.fillStyle=n.color;ctx.fill();
      }

      // Labels
      ctx.globalAlpha=isDim?0.15:1;
      ctx.textAlign="center";

      if(n.type==="root"){
        ctx.font="bold 12px 'SF Mono',monospace";
        ctx.fillStyle="#fff";
        ctx.fillText(n.label,n.x,n.y+4);
        ctx.font="9px system-ui,sans-serif";
        ctx.fillStyle="rgba(255,255,255,0.65)";
        ctx.fillText(n.sublabel,n.x,n.y+r+12);

      } else if(n.type==="entity"){
        ctx.font="bold 10px 'SF Mono',monospace";
        ctx.fillStyle=n.color;
        ctx.fillText(n.label,n.x,n.y+3);
        ctx.font="9px system-ui,sans-serif";
        ctx.fillStyle=C.txtm;
        ctx.fillText(n.sub,n.x,n.y+r+12);

      } else if(n.type==="cause"){
        ctx.font="bold 9.5px system-ui,sans-serif";
        ctx.fillStyle=n.color;
        ctx.fillText(n.label,n.x,n.y+r+12);

      } else if(n.type==="api"){
        const vis=(isHov||isSel)?1:0.8;
        ctx.globalAlpha=isDim?0.15:vis;
        ctx.font="9px system-ui,sans-serif";
        ctx.fillStyle=C.txts;
        const lbl=n.label.length>12?n.label.slice(0,12)+"…":n.label;
        ctx.fillText(lbl,n.x,n.y+r+12);
        if(isHov||isSel){
          ctx.font="8px system-ui,sans-serif";
          ctx.fillStyle=C.txtm;
          ctx.fillText(n.sublabel,n.x,n.y+r+22);
        }

      } else if(n.type==="animal"){
        ctx.font="9px system-ui,sans-serif";
        ctx.fillStyle=C.txts;
        const short=n.label.split(" ")[0];
        ctx.fillText(short,n.x,n.y+r+12);

      } else if(n.type==="symptom"){
        if(isHov||isSel){
          ctx.font="9px system-ui,sans-serif";
          ctx.fillStyle=C.txts;
          ctx.fillText(n.label,n.x,n.y+r+12);
        }

      } else if(n.type==="disease"){
        if(isHov||isSel){
          // label above
          ctx.font="bold 10px system-ui,sans-serif";
          ctx.fillStyle=n.color;
          ctx.fillText(n.label,n.x,n.y-r-6);
          ctx.font="8px 'SF Mono',monospace";
          ctx.fillStyle=C.txtm;
          const eng=n.sublabel||"";
          ctx.fillText(eng.length>26?eng.slice(0,26)+"…":eng,n.x,n.y-r-17);
          ctx.font="9px system-ui,sans-serif";
          ctx.fillStyle=C.txts;
          ctx.fillText(n.animal+" · "+n.cause,n.x,n.y+r+12);
        } else {
          // always show short label when visible
          ctx.globalAlpha=isDim?0.1:0.6;
          ctx.font="8px system-ui,sans-serif";
          ctx.fillStyle=n.color;
          ctx.fillText(n.label.length>7?n.label.slice(0,7)+"…":n.label,n.x,n.y+r+10);
        }
      }
      ctx.restore();
    });

    ctx.restore();
  },[hoverId,selected,filterMode]);

  // ── Animation loop ─────────────────────────────────────────────────────────
  useEffect(()=>{
    const loop=()=>{
      if(frameRef.current<380){simulate();frameRef.current++;}
      render();
      animRef.current=requestAnimationFrame(loop);
    };
    animRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(animRef.current);
  },[simulate,render]);

  // ── Canvas resize ──────────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const resize=()=>{
      canvas.width=canvas.parentElement.clientWidth;
      canvas.height=canvas.parentElement.clientHeight;
      buildGraph(canvas.width,canvas.height);
    };
    resize();
    window.addEventListener("resize",resize);
    return ()=>window.removeEventListener("resize",resize);
  },[buildGraph]);

  // ── Mouse ──────────────────────────────────────────────────────────────────
  const toWorld=useCallback((ex,ey)=>{
    const {x:tx,y:ty,scale}=transformRef.current;
    return {wx:(ex-tx)/scale,wy:(ey-ty)/scale};
  },[]);
  const findNode=useCallback((wx,wy)=>
    nodesRef.current.find(n=>{const dx=n.x-wx,dy=n.y-wy;return Math.sqrt(dx*dx+dy*dy)<=n.r+4;})
  ,[]);

  const onMouseMove=useCallback(e=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const {wx,wy}=toWorld(e.clientX-rect.left,e.clientY-rect.top);
    const node=findNode(wx,wy);
    setHoverId(node?.id||null);
    canvasRef.current.style.cursor=node?"pointer":mouseRef.current.pan?"grabbing":"grab";
    if(mouseRef.current.drag){
      const n=mouseRef.current.drag;
      const {scale}=transformRef.current;
      n.x+=e.movementX/scale;n.y+=e.movementY/scale;
    } else if(mouseRef.current.pan){
      transformRef.current.x+=e.movementX;
      transformRef.current.y+=e.movementY;
    }
  },[toWorld,findNode]);

  const onMouseDown=useCallback(e=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const {wx,wy}=toWorld(e.clientX-rect.left,e.clientY-rect.top);
    const node=findNode(wx,wy);
    if(node){mouseRef.current.drag=node;node.fixed=true;}
    else{mouseRef.current.pan=true;}
  },[toWorld,findNode]);

  const onMouseUp=useCallback(e=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const {wx,wy}=toWorld(e.clientX-rect.left,e.clientY-rect.top);
    const node=findNode(wx,wy);
    if(mouseRef.current.drag===node&&node)
      setSelected(prev=>prev?.id===node.id?null:node);
    if(mouseRef.current.drag)mouseRef.current.drag.fixed=false;
    mouseRef.current.drag=null;mouseRef.current.pan=false;
  },[toWorld,findNode]);

  const onWheel=useCallback(e=>{
    e.preventDefault();
    const rect=canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const {x:tx,y:ty,scale}=transformRef.current;
    const f=e.deltaY>0?0.9:1.1;
    const ns=Math.max(0.2,Math.min(4,scale*f));
    transformRef.current.x=mx-(mx-tx)/scale*ns;
    transformRef.current.y=my-(my-ty)/scale*ns;
    transformRef.current.scale=ns;
  },[]);

  const resetView=useCallback(()=>{
    transformRef.current={...initRef.current};
    setSelected(null);
  },[]);

  const LEGEND=[
    {color:C.root,  label:"ex:PetGraph (루트 노드)"},
    {color:C.eFac,  label:"ex:Facility (시설 정보)"},
    {color:C.eMed,  label:"ex:Medical (의료 정보)"},
    {color:C.eAni,  label:"ex:Animal (동물 개체)"},
    {color:C.eReg,  label:"ex:Region (지역 정보)"},
    {color:C.apiFac,label:"API — 행정안전부"},
    {color:C.apiMed,label:"API — 질병/증상"},
    {color:C.apiAni,label:"API — 동물보호"},
    {color:C.apiPl, label:"API — 관광/문화"},
    {color:C.dVirus,label:"질병 — 바이러스성 (28건)"},
    {color:C.dBact, label:"질병 — 세균성 (25건)"},
    {color:C.dPara, label:"질병 — 기생충성 (9건)"},
    {color:C.dFungi,label:"질병 — 곰팡이성 (3건)"},
    {color:C.dOther,label:"질병 — 기타 (50건+)"},
  ];

  const FILTERS=[
    {id:"all",    label:"전체 보기"},
    {id:"disease",label:"질병 116건"},
    {id:"cause",  label:"원인 분류"},
    {id:"api",    label:"API 소스"},
    {id:"animal", label:"동물 종"},
  ];

  const btnStyle=(active)=>({
    padding:"5px 11px",fontSize:11,fontFamily:"system-ui,sans-serif",
    borderRadius:5,cursor:"pointer",transition:"all 0.15s",
    background:active?"#0f172a":"#ffffff",
    color:active?"#ffffff":"#475569",
    border:`1px solid ${active?"#0f172a":"#e2e8f0"}`,
    boxShadow:active?"none":"0 1px 2px rgba(0,0,0,0.04)",
  });

  return (
    <div style={{width:"100%",height:"100vh",background:C.bg,display:"flex",
      flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif"}}>

      {/* ─── 헤더 ─── */}
      <div style={{padding:"10px 20px",display:"flex",alignItems:"center",
        justifyContent:"space-between",background:C.panel,
        borderBottom:`1px solid ${C.border}`,
        boxShadow:"0 1px 3px rgba(0,0,0,0.06)",flexShrink:0}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:C.txt}}>
            Pet-Graph
            <span style={{color:"#94a3b8",fontWeight:400,margin:"0 6px"}}>/</span>
            <span style={{color:C.eFac}}>지식그래프 시각화</span>
          </div>
          <div style={{fontSize:11,color:C.txtm,marginTop:1}}>
            총 {stats.nodes}개 노드 · {stats.edges}개 엣지 · 질병 116건 · API 14개 · Hover 시 연결 강조
          </div>
        </div>

        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {FILTERS.map(f=>(
            <button key={f.id} onClick={()=>setFilterMode(f.id)}
              style={btnStyle(filterMode===f.id)}>{f.label}</button>
          ))}
          <div style={{width:1,height:20,background:C.border,margin:"0 2px"}}/>
          {/* ─── 홈 버튼 ─── */}
          <button onClick={resetView} title="초기 화면으로 돌아가기"
            style={{...btnStyle(false),display:"flex",alignItems:"center",gap:4}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L2 7h2v6h4v-4h4v4h2V7l-6-5z" fill="#475569"/>
            </svg>
            초기화면
          </button>
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* ─── Canvas ─── */}
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          <canvas ref={canvasRef}
            style={{display:"block",width:"100%",height:"100%"}}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onWheel={onWheel}
            onMouseLeave={()=>{mouseRef.current.pan=false;mouseRef.current.drag=null;}}
          />
          <div style={{position:"absolute",bottom:12,left:14,fontSize:10,color:C.txtm,
            background:"rgba(255,255,255,0.88)",backdropFilter:"blur(4px)",
            padding:"4px 9px",borderRadius:4,border:`1px solid ${C.border}`}}>
            스크롤: 줌 · 빈 공간 드래그: 이동 · 노드 드래그: 배치 · Hover: 연결 강조 · 클릭: 상세 선택
          </div>
        </div>

        {/* ─── 사이드 패널 ─── */}
        <div style={{width:232,background:C.panel,borderLeft:`1px solid ${C.border}`,
          display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>

          {/* 선택 노드 */}
          <div style={{padding:13,borderBottom:`1px solid #f1f5f9`,minHeight:112}}>
            {selected ? (
              <>
                <div style={{fontSize:9,color:C.txtm,letterSpacing:1.2,
                  marginBottom:7,textTransform:"uppercase"}}>Selected Node</div>
                <div style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:5}}>
                  <div style={{width:9,height:9,borderRadius:"50%",background:selected.color,
                    flexShrink:0,marginTop:3}}/>
                  <div style={{fontSize:12,fontWeight:600,color:C.txt,lineHeight:1.4,
                    wordBreak:"break-all",fontFamily:"'SF Mono',monospace"}}>
                    {selected.label}
                  </div>
                </div>
                {selected.sublabel&&(
                  <div style={{fontSize:9,color:C.txtm,fontFamily:"monospace",
                    marginBottom:4,wordBreak:"break-all",lineHeight:1.4}}>
                    {selected.sublabel}
                  </div>
                )}
                {selected.animal&&(
                  <div style={{fontSize:10,color:"#0369a1",marginBottom:2}}>동물: {selected.animal}</div>
                )}
                {selected.cause&&(
                  <div style={{fontSize:10,color:CAUSE_CLR(selected.cause),marginBottom:2}}>
                    원인: {selected.cause}
                  </div>
                )}
                {selected.sublabel&&selected.provider&&(
                  <div style={{fontSize:10,color:C.txtm}}>출처: {selected.provider}</div>
                )}
                <div style={{fontSize:9,color:"#cbd5e1",marginTop:5,
                  textTransform:"uppercase",letterSpacing:0.5}}>
                  rdf:type · {selected.type}
                </div>
                <button onClick={()=>setSelected(null)}
                  style={{marginTop:6,fontSize:10,color:C.txtm,background:"none",
                    border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>
                  선택 해제
                </button>
              </>
            ):(
              <div style={{fontSize:11,color:"#cbd5e1",paddingTop:18,textAlign:"center",
                lineHeight:1.6}}>
                노드를 클릭하면<br/>상세 정보가 표시됩니다
              </div>
            )}
          </div>

          {/* 범례 */}
          <div style={{padding:13,flex:1,overflowY:"auto"}}>
            <div style={{fontSize:9,color:C.txtm,letterSpacing:1.2,
              marginBottom:9,textTransform:"uppercase"}}>Legend</div>
            {LEGEND.map(l=>(
              <div key={l.label} style={{display:"flex",alignItems:"center",
                gap:6,marginBottom:5}}>
                <div style={{width:8,height:8,borderRadius:"50%",
                  background:l.color,flexShrink:0}}/>
                <span style={{fontSize:9.5,color:C.txtm,lineHeight:1.3}}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* 통계 */}
          <div style={{padding:13,borderTop:`1px solid #f1f5f9`}}>
            <div style={{fontSize:9,color:C.txtm,letterSpacing:1.2,
              marginBottom:7,textTransform:"uppercase"}}>Stats</div>
            {[
              {label:"전체 노드",  value:stats.nodes},
              {label:"전체 엣지",  value:stats.edges},
              {label:"질병 레코드",value:116},
              {label:"API 소스",   value:14},
              {label:"동물 종",   value:8},
              {label:"증상 분류", value:8},
              {label:"원인 분류", value:5},
            ].map(s=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",
                marginBottom:4}}>
                <span style={{fontSize:10,color:C.txtm}}>{s.label}</span>
                <span style={{fontSize:10,color:C.txt,fontWeight:600,
                  fontFamily:"monospace"}}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
