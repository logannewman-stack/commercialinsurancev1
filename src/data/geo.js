/* ZIP prefix (first 3 digits) to state. */
const ZIP3 = [[10,27,"MA"],[28,29,"RI"],[30,38,"NH"],[39,49,"ME"],[50,59,"VT"],[60,69,"CT"],[70,89,"NJ"],[100,149,"NY"],[150,196,"PA"],[197,199,"DE"],[200,205,"DC"],[206,219,"MD"],[220,246,"VA"],[247,268,"WV"],[270,289,"NC"],[290,299,"SC"],[300,319,"GA"],[320,349,"FL"],[350,369,"AL"],[370,385,"TN"],[386,397,"MS"],[398,399,"GA"],[400,427,"KY"],[430,459,"OH"],[460,479,"IN"],[480,499,"MI"],[500,528,"IA"],[530,549,"WI"],[550,567,"MN"],[570,577,"SD"],[580,588,"ND"],[590,599,"MT"],[600,629,"IL"],[630,658,"MO"],[660,679,"KS"],[680,693,"NE"],[700,714,"LA"],[716,729,"AR"],[730,749,"OK"],[750,799,"TX"],[800,816,"CO"],[820,831,"WY"],[832,838,"ID"],[840,847,"UT"],[850,865,"AZ"],[870,884,"NM"],[885,885,"TX"],[889,898,"NV"],[900,961,"CA"],[967,968,"HI"],[970,979,"OR"],[980,994,"WA"],[995,999,"AK"]];

export const STATE_NAMES = { AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"Washington, D.C.",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming" };

/* State rate relativities by coverage family (1 = national average). Illustrative. */
export const FACT = {
  liab: { NY:1.3, CA:1.2, FL:1.25, NJ:1.2, IL:1.1, LA:1.3, GA:1.1, NV:1.1, PA:1.05, MI:1.1, TX:1.05, DC:1.15, ID:0.85, ME:0.85, VT:0.85, ND:0.85, SD:0.85, IA:0.88, WI:0.9, NE:0.9, WY:0.9, MT:0.9, UT:0.92, OH:0.92, IN:0.92, NH:0.9, KS:0.92 },
  prop: { FL:1.55, LA:1.45, TX:1.25, OK:1.2, SC:1.15, NC:1.1, AL:1.15, MS:1.2, CA:1.15, CO:1.1, KS:1.1, NE:1.05, HI:1.1 },
  wc: { CA:1.45, NY:1.3, NJ:1.25, IL:1.15, PA:1.1, AK:1.3, MT:1.2, CT:1.2, TX:0.72, AR:0.75, IN:0.75, ND:0.75, UT:0.8, AZ:0.8, VA:0.8 },
  auto: { MI:1.4, NY:1.35, LA:1.35, FL:1.3, NJ:1.25, CA:1.15, TX:1.1, GA:1.1 },
};

export function zipState(zip) {
  if (!/^\d{5}$/.test(zip || "")) return null;
  const p = parseInt(zip.slice(0, 3), 10);
  for (const [a, b, st] of ZIP3) if (p >= a && p <= b) return st;
  return null;
}
