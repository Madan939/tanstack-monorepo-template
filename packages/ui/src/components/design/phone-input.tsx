import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan", dialCode: "+93", flag: getFlagEmoji("AF") },
  { code: "AX", name: "Åland Islands", dialCode: "+358", flag: getFlagEmoji("AX") },
  { code: "AL", name: "Albania", dialCode: "+355", flag: getFlagEmoji("AL") },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: getFlagEmoji("DZ") },
  { code: "AS", name: "American Samoa", dialCode: "+1684", flag: getFlagEmoji("AS") },
  { code: "AD", name: "Andorra", dialCode: "+376", flag: getFlagEmoji("AD") },
  { code: "AO", name: "Angola", dialCode: "+244", flag: getFlagEmoji("AO") },
  { code: "AI", name: "Anguilla", dialCode: "+1264", flag: getFlagEmoji("AI") },
  { code: "AQ", name: "Antarctica", dialCode: "+672", flag: getFlagEmoji("AQ") },
  { code: "AG", name: "Antigua and Barbuda", dialCode: "+1268", flag: getFlagEmoji("AG") },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: getFlagEmoji("AR") },
  { code: "AM", name: "Armenia", dialCode: "+374", flag: getFlagEmoji("AM") },
  { code: "AW", name: "Aruba", dialCode: "+297", flag: getFlagEmoji("AW") },
  { code: "AU", name: "Australia", dialCode: "+61", flag: getFlagEmoji("AU") },
  { code: "AT", name: "Austria", dialCode: "+43", flag: getFlagEmoji("AT") },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994", flag: getFlagEmoji("AZ") },
  { code: "BS", name: "Bahamas", dialCode: "+1242", flag: getFlagEmoji("BS") },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: getFlagEmoji("BH") },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: getFlagEmoji("BD") },
  { code: "BB", name: "Barbados", dialCode: "+1246", flag: getFlagEmoji("BB") },
  { code: "BY", name: "Belarus", dialCode: "+375", flag: getFlagEmoji("BY") },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: getFlagEmoji("BE") },
  { code: "BZ", name: "Belize", dialCode: "+501", flag: getFlagEmoji("BZ") },
  { code: "BJ", name: "Benin", dialCode: "+229", flag: getFlagEmoji("BJ") },
  { code: "BM", name: "Bermuda", dialCode: "+1441", flag: getFlagEmoji("BM") },
  { code: "BT", name: "Bhutan", dialCode: "+975", flag: getFlagEmoji("BT") },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: getFlagEmoji("BO") },
  { code: "BA", name: "Bosnia and Herzegovina", dialCode: "+387", flag: getFlagEmoji("BA") },
  { code: "BW", name: "Botswana", dialCode: "+267", flag: getFlagEmoji("BW") },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: getFlagEmoji("BR") },
  {
    code: "IO",
    name: "British Indian Ocean Territory",
    dialCode: "+246",
    flag: getFlagEmoji("IO"),
  },
  { code: "VG", name: "British Virgin Islands", dialCode: "+1284", flag: getFlagEmoji("VG") },
  { code: "BN", name: "Brunei", dialCode: "+673", flag: getFlagEmoji("BN") },
  { code: "BG", name: "Bulgaria", dialCode: "+359", flag: getFlagEmoji("BG") },
  { code: "BF", name: "Burkina Faso", dialCode: "+226", flag: getFlagEmoji("BF") },
  { code: "BI", name: "Burundi", dialCode: "+257", flag: getFlagEmoji("BI") },
  { code: "KH", name: "Cambodia", dialCode: "+855", flag: getFlagEmoji("KH") },
  { code: "CM", name: "Cameroon", dialCode: "+237", flag: getFlagEmoji("CM") },
  { code: "CA", name: "Canada", dialCode: "+1", flag: getFlagEmoji("CA") },
  { code: "CV", name: "Cape Verde", dialCode: "+238", flag: getFlagEmoji("CV") },
  { code: "KY", name: "Cayman Islands", dialCode: "+1345", flag: getFlagEmoji("KY") },
  { code: "CF", name: "Central African Republic", dialCode: "+236", flag: getFlagEmoji("CF") },
  { code: "TD", name: "Chad", dialCode: "+235", flag: getFlagEmoji("TD") },
  { code: "CL", name: "Chile", dialCode: "+56", flag: getFlagEmoji("CL") },
  { code: "CN", name: "China", dialCode: "+86", flag: getFlagEmoji("CN") },
  { code: "CX", name: "Christmas Island", dialCode: "+61", flag: getFlagEmoji("CX") },
  { code: "CC", name: "Cocos (Keeling) Islands", dialCode: "+61", flag: getFlagEmoji("CC") },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: getFlagEmoji("CO") },
  { code: "KM", name: "Comoros", dialCode: "+269", flag: getFlagEmoji("KM") },
  { code: "CG", name: "Congo - Brazzaville", dialCode: "+242", flag: getFlagEmoji("CG") },
  { code: "CD", name: "Congo - Kinshasa", dialCode: "+243", flag: getFlagEmoji("CD") },
  { code: "CK", name: "Cook Islands", dialCode: "+682", flag: getFlagEmoji("CK") },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: getFlagEmoji("CR") },
  { code: "CI", name: "Cote d'Ivoire", dialCode: "+225", flag: getFlagEmoji("CI") },
  { code: "HR", name: "Croatia", dialCode: "+385", flag: getFlagEmoji("HR") },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: getFlagEmoji("CU") },
  { code: "CW", name: "Curaçao", dialCode: "+599", flag: getFlagEmoji("CW") },
  { code: "CY", name: "Cyprus", dialCode: "+357", flag: getFlagEmoji("CY") },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: getFlagEmoji("CZ") },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: getFlagEmoji("DK") },
  { code: "DJ", name: "Djibouti", dialCode: "+253", flag: getFlagEmoji("DJ") },
  { code: "DM", name: "Dominica", dialCode: "+1767", flag: getFlagEmoji("DM") },
  { code: "DO", name: "Dominican Republic", dialCode: "+1809", flag: getFlagEmoji("DO") },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: getFlagEmoji("EC") },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: getFlagEmoji("EG") },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: getFlagEmoji("SV") },
  { code: "GQ", name: "Equatorial Guinea", dialCode: "+240", flag: getFlagEmoji("GQ") },
  { code: "ER", name: "Eritrea", dialCode: "+291", flag: getFlagEmoji("ER") },
  { code: "EE", name: "Estonia", dialCode: "+372", flag: getFlagEmoji("EE") },
  { code: "SZ", name: "Eswatini", dialCode: "+268", flag: getFlagEmoji("SZ") },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: getFlagEmoji("ET") },
  { code: "FK", name: "Falkland Islands", dialCode: "+500", flag: getFlagEmoji("FK") },
  { code: "FO", name: "Faroe Islands", dialCode: "+298", flag: getFlagEmoji("FO") },
  { code: "FJ", name: "Fiji", dialCode: "+679", flag: getFlagEmoji("FJ") },
  { code: "FI", name: "Finland", dialCode: "+358", flag: getFlagEmoji("FI") },
  { code: "FR", name: "France", dialCode: "+33", flag: getFlagEmoji("FR") },
  { code: "GF", name: "French Guiana", dialCode: "+594", flag: getFlagEmoji("GF") },
  { code: "PF", name: "French Polynesia", dialCode: "+689", flag: getFlagEmoji("PF") },
  { code: "GA", name: "Gabon", dialCode: "+241", flag: getFlagEmoji("GA") },
  { code: "GM", name: "Gambia", dialCode: "+220", flag: getFlagEmoji("GM") },
  { code: "GE", name: "Georgia", dialCode: "+995", flag: getFlagEmoji("GE") },
  { code: "DE", name: "Germany", dialCode: "+49", flag: getFlagEmoji("DE") },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: getFlagEmoji("GH") },
  { code: "GI", name: "Gibraltar", dialCode: "+350", flag: getFlagEmoji("GI") },
  { code: "GR", name: "Greece", dialCode: "+30", flag: getFlagEmoji("GR") },
  { code: "GL", name: "Greenland", dialCode: "+299", flag: getFlagEmoji("GL") },
  { code: "GD", name: "Grenada", dialCode: "+1473", flag: getFlagEmoji("GD") },
  { code: "GP", name: "Guadeloupe", dialCode: "+590", flag: getFlagEmoji("GP") },
  { code: "GU", name: "Guam", dialCode: "+1671", flag: getFlagEmoji("GU") },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: getFlagEmoji("GT") },
  { code: "GG", name: "Guernsey", dialCode: "+44", flag: getFlagEmoji("GG") },
  { code: "GN", name: "Guinea", dialCode: "+224", flag: getFlagEmoji("GN") },
  { code: "GW", name: "Guinea-Bissau", dialCode: "+245", flag: getFlagEmoji("GW") },
  { code: "GY", name: "Guyana", dialCode: "+592", flag: getFlagEmoji("GY") },
  { code: "HT", name: "Haiti", dialCode: "+509", flag: getFlagEmoji("HT") },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: getFlagEmoji("HN") },
  { code: "HK", name: "Hong Kong SAR", dialCode: "+852", flag: getFlagEmoji("HK") },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: getFlagEmoji("HU") },
  { code: "IS", name: "Iceland", dialCode: "+354", flag: getFlagEmoji("IS") },
  { code: "IN", name: "India", dialCode: "+91", flag: getFlagEmoji("IN") },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: getFlagEmoji("ID") },
  { code: "IR", name: "Iran", dialCode: "+98", flag: getFlagEmoji("IR") },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: getFlagEmoji("IQ") },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: getFlagEmoji("IE") },
  { code: "IM", name: "Isle of Man", dialCode: "+44", flag: getFlagEmoji("IM") },
  { code: "IL", name: "Israel", dialCode: "+972", flag: getFlagEmoji("IL") },
  { code: "IT", name: "Italy", dialCode: "+39", flag: getFlagEmoji("IT") },
  { code: "JM", name: "Jamaica", dialCode: "+1876", flag: getFlagEmoji("JM") },
  { code: "JP", name: "Japan", dialCode: "+81", flag: getFlagEmoji("JP") },
  { code: "JE", name: "Jersey", dialCode: "+44", flag: getFlagEmoji("JE") },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: getFlagEmoji("JO") },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: getFlagEmoji("KZ") },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: getFlagEmoji("KE") },
  { code: "KI", name: "Kiribati", dialCode: "+686", flag: getFlagEmoji("KI") },
  { code: "XK", name: "Kosovo", dialCode: "+383", flag: getFlagEmoji("XK") },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: getFlagEmoji("KW") },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996", flag: getFlagEmoji("KG") },
  { code: "LA", name: "Laos", dialCode: "+856", flag: getFlagEmoji("LA") },
  { code: "LV", name: "Latvia", dialCode: "+371", flag: getFlagEmoji("LV") },
  { code: "LB", name: "Lebanon", dialCode: "+961", flag: getFlagEmoji("LB") },
  { code: "LS", name: "Lesotho", dialCode: "+266", flag: getFlagEmoji("LS") },
  { code: "LR", name: "Liberia", dialCode: "+231", flag: getFlagEmoji("LR") },
  { code: "LY", name: "Libya", dialCode: "+218", flag: getFlagEmoji("LY") },
  { code: "LI", name: "Liechtenstein", dialCode: "+423", flag: getFlagEmoji("LI") },
  { code: "LT", name: "Lithuania", dialCode: "+370", flag: getFlagEmoji("LT") },
  { code: "LU", name: "Luxembourg", dialCode: "+352", flag: getFlagEmoji("LU") },
  { code: "MO", name: "Macao SAR", dialCode: "+853", flag: getFlagEmoji("MO") },
  { code: "MK", name: "North Macedonia", dialCode: "+389", flag: getFlagEmoji("MK") },
  { code: "MG", name: "Madagascar", dialCode: "+261", flag: getFlagEmoji("MG") },
  { code: "MW", name: "Malawi", dialCode: "+265", flag: getFlagEmoji("MW") },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: getFlagEmoji("MY") },
  { code: "MV", name: "Maldives", dialCode: "+960", flag: getFlagEmoji("MV") },
  { code: "ML", name: "Mali", dialCode: "+223", flag: getFlagEmoji("ML") },
  { code: "MT", name: "Malta", dialCode: "+356", flag: getFlagEmoji("MT") },
  { code: "MH", name: "Marshall Islands", dialCode: "+692", flag: getFlagEmoji("MH") },
  { code: "MQ", name: "Martinique", dialCode: "+596", flag: getFlagEmoji("MQ") },
  { code: "MR", name: "Mauritania", dialCode: "+222", flag: getFlagEmoji("MR") },
  { code: "MU", name: "Mauritius", dialCode: "+230", flag: getFlagEmoji("MU") },
  { code: "YT", name: "Mayotte", dialCode: "+262", flag: getFlagEmoji("YT") },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: getFlagEmoji("MX") },
  { code: "FM", name: "Micronesia", dialCode: "+691", flag: getFlagEmoji("FM") },
  { code: "MD", name: "Moldova", dialCode: "+373", flag: getFlagEmoji("MD") },
  { code: "MC", name: "Monaco", dialCode: "+377", flag: getFlagEmoji("MC") },
  { code: "MN", name: "Mongolia", dialCode: "+976", flag: getFlagEmoji("MN") },
  { code: "ME", name: "Montenegro", dialCode: "+382", flag: getFlagEmoji("ME") },
  { code: "MS", name: "Montserrat", dialCode: "+1664", flag: getFlagEmoji("MS") },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: getFlagEmoji("MA") },
  { code: "MZ", name: "Mozambique", dialCode: "+258", flag: getFlagEmoji("MZ") },
  { code: "MM", name: "Myanmar (Burma)", dialCode: "+95", flag: getFlagEmoji("MM") },
  { code: "NA", name: "Namibia", dialCode: "+264", flag: getFlagEmoji("NA") },
  { code: "NR", name: "Nauru", dialCode: "+674", flag: getFlagEmoji("NR") },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: getFlagEmoji("NP") },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: getFlagEmoji("NL") },
  { code: "NC", name: "New Caledonia", dialCode: "+687", flag: getFlagEmoji("NC") },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: getFlagEmoji("NZ") },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: getFlagEmoji("NI") },
  { code: "NE", name: "Niger", dialCode: "+227", flag: getFlagEmoji("NE") },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: getFlagEmoji("NG") },
  { code: "NU", name: "Niue", dialCode: "+683", flag: getFlagEmoji("NU") },
  { code: "NF", name: "Norfolk Island", dialCode: "+672", flag: getFlagEmoji("NF") },
  { code: "KP", name: "North Korea", dialCode: "+850", flag: getFlagEmoji("KP") },
  { code: "MP", name: "Northern Mariana Islands", dialCode: "+1670", flag: getFlagEmoji("MP") },
  { code: "NO", name: "Norway", dialCode: "+47", flag: getFlagEmoji("NO") },
  { code: "OM", name: "Oman", dialCode: "+968", flag: getFlagEmoji("OM") },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: getFlagEmoji("PK") },
  { code: "PW", name: "Palau", dialCode: "+680", flag: getFlagEmoji("PW") },
  { code: "PS", name: "Palestine", dialCode: "+970", flag: getFlagEmoji("PS") },
  { code: "PA", name: "Panama", dialCode: "+507", flag: getFlagEmoji("PA") },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675", flag: getFlagEmoji("PG") },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: getFlagEmoji("PY") },
  { code: "PE", name: "Peru", dialCode: "+51", flag: getFlagEmoji("PE") },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: getFlagEmoji("PH") },
  { code: "PN", name: "Pitcairn Islands", dialCode: "+64", flag: getFlagEmoji("PN") },
  { code: "PL", name: "Poland", dialCode: "+48", flag: getFlagEmoji("PL") },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: getFlagEmoji("PT") },
  { code: "PR", name: "Puerto Rico", dialCode: "+1787", flag: getFlagEmoji("PR") },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: getFlagEmoji("QA") },
  { code: "RE", name: "Réunion", dialCode: "+262", flag: getFlagEmoji("RE") },
  { code: "RO", name: "Romania", dialCode: "+40", flag: getFlagEmoji("RO") },
  { code: "RU", name: "Russia", dialCode: "+7", flag: getFlagEmoji("RU") },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: getFlagEmoji("RW") },
  { code: "BL", name: "Saint Barthélemy", dialCode: "+590", flag: getFlagEmoji("BL") },
  { code: "SH", name: "Saint Helena", dialCode: "+290", flag: getFlagEmoji("SH") },
  { code: "KN", name: "Saint Kitts and Nevis", dialCode: "+1869", flag: getFlagEmoji("KN") },
  { code: "LC", name: "Saint Lucia", dialCode: "+1758", flag: getFlagEmoji("LC") },
  { code: "MF", name: "Saint Martin", dialCode: "+590", flag: getFlagEmoji("MF") },
  { code: "PM", name: "Saint Pierre and Miquelon", dialCode: "+508", flag: getFlagEmoji("PM") },
  {
    code: "VC",
    name: "Saint Vincent and the Grenadines",
    dialCode: "+1784",
    flag: getFlagEmoji("VC"),
  },
  { code: "WS", name: "Samoa", dialCode: "+685", flag: getFlagEmoji("WS") },
  { code: "SM", name: "San Marino", dialCode: "+378", flag: getFlagEmoji("SM") },
  { code: "ST", name: "São Tomé and Príncipe", dialCode: "+239", flag: getFlagEmoji("ST") },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: getFlagEmoji("SA") },
  { code: "SN", name: "Senegal", dialCode: "+221", flag: getFlagEmoji("SN") },
  { code: "RS", name: "Serbia", dialCode: "+381", flag: getFlagEmoji("RS") },
  { code: "SC", name: "Seychelles", dialCode: "+248", flag: getFlagEmoji("SC") },
  { code: "SL", name: "Sierra Leone", dialCode: "+232", flag: getFlagEmoji("SL") },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: getFlagEmoji("SG") },
  { code: "SX", name: "Sint Maarten", dialCode: "+1721", flag: getFlagEmoji("SX") },
  { code: "SK", name: "Slovakia", dialCode: "+421", flag: getFlagEmoji("SK") },
  { code: "SI", name: "Slovenia", dialCode: "+386", flag: getFlagEmoji("SI") },
  { code: "SB", name: "Solomon Islands", dialCode: "+677", flag: getFlagEmoji("SB") },
  { code: "SO", name: "Somalia", dialCode: "+252", flag: getFlagEmoji("SO") },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: getFlagEmoji("ZA") },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: getFlagEmoji("KR") },
  { code: "SS", name: "South Sudan", dialCode: "+211", flag: getFlagEmoji("SS") },
  { code: "ES", name: "Spain", dialCode: "+34", flag: getFlagEmoji("ES") },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: getFlagEmoji("LK") },
  { code: "SD", name: "Sudan", dialCode: "+249", flag: getFlagEmoji("SD") },
  { code: "SR", name: "Suriname", dialCode: "+597", flag: getFlagEmoji("SR") },
  { code: "SJ", name: "Svalbard and Jan Mayen", dialCode: "+47", flag: getFlagEmoji("SJ") },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: getFlagEmoji("SE") },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: getFlagEmoji("CH") },
  { code: "SY", name: "Syria", dialCode: "+963", flag: getFlagEmoji("SY") },
  { code: "TW", name: "Taiwan", dialCode: "+886", flag: getFlagEmoji("TW") },
  { code: "TJ", name: "Tajikistan", dialCode: "+992", flag: getFlagEmoji("TJ") },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: getFlagEmoji("TZ") },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: getFlagEmoji("TH") },
  { code: "TL", name: "Timor-Leste", dialCode: "+670", flag: getFlagEmoji("TL") },
  { code: "TG", name: "Togo", dialCode: "+228", flag: getFlagEmoji("TG") },
  { code: "TK", name: "Tokelau", dialCode: "+690", flag: getFlagEmoji("TK") },
  { code: "TO", name: "Tonga", dialCode: "+676", flag: getFlagEmoji("TO") },
  { code: "TT", name: "Trinidad and Tobago", dialCode: "+1868", flag: getFlagEmoji("TT") },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: getFlagEmoji("TN") },
  { code: "TR", name: "Turkey", dialCode: "+90", flag: getFlagEmoji("TR") },
  { code: "TM", name: "Turkmenistan", dialCode: "+993", flag: getFlagEmoji("TM") },
  { code: "TC", name: "Turks and Caicos Islands", dialCode: "+1649", flag: getFlagEmoji("TC") },
  { code: "TV", name: "Tuvalu", dialCode: "+688", flag: getFlagEmoji("TV") },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: getFlagEmoji("UG") },
  { code: "UA", name: "Ukraine", dialCode: "+380", flag: getFlagEmoji("UA") },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: getFlagEmoji("AE") },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: getFlagEmoji("GB") },
  { code: "US", name: "United States", dialCode: "+1", flag: getFlagEmoji("US") },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: getFlagEmoji("UY") },
  { code: "UZ", name: "Uzbekistan", dialCode: "+998", flag: getFlagEmoji("UZ") },
  { code: "VU", name: "Vanuatu", dialCode: "+678", flag: getFlagEmoji("VU") },
  { code: "VA", name: "Vatican City", dialCode: "+379", flag: getFlagEmoji("VA") },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: getFlagEmoji("VE") },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: getFlagEmoji("VN") },
  { code: "VI", name: "U.S. Virgin Islands", dialCode: "+1340", flag: getFlagEmoji("VI") },
  { code: "WF", name: "Wallis and Futuna", dialCode: "+681", flag: getFlagEmoji("WF") },
  { code: "EH", name: "Western Sahara", dialCode: "+212", flag: getFlagEmoji("EH") },
  { code: "YE", name: "Yemen", dialCode: "+967", flag: getFlagEmoji("YE") },
  { code: "ZM", name: "Zambia", dialCode: "+260", flag: getFlagEmoji("ZM") },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: getFlagEmoji("ZW") },
]

export interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "size" | "onChange"> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  defaultCountry?: string
  onCountryChange?: (country: Country) => void
  size?: "default" | "lg"
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      onChange,
      defaultCountry = "US",
      onCountryChange,
      size = "default",
      disabled,
      placeholder = "Enter phone number",
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(() => {
      const found = COUNTRIES.find((c) => c.code.toUpperCase() === defaultCountry.toUpperCase())
      return found ?? COUNTRIES[0]
    })

    const [internalValue, setInternalValue] = React.useState<string>(
      defaultValue ?? controlledValue ?? "",
    )

    const isControlled = controlledValue !== undefined
    const currentValue = isControlled ? controlledValue : internalValue

    const handleCountrySelect = (country: Country) => {
      setSelectedCountry(country)
      onCountryChange?.(country)
      setOpen(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (!isControlled) {
        setInternalValue(val)
      }
      onChange?.(val)
    }

    const isInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true"

    return (
      <div
        data-disabled={disabled ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
        className={cn(
          "group flex w-full min-w-0 items-center rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] overflow-hidden",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:border-input data-[disabled=true]:bg-muted data-[disabled=true]:text-muted-foreground",
          "data-[invalid=true]:border-destructive focus-within:data-[invalid=true]:border-destructive focus-within:data-[invalid=true]:ring-2 data-[invalid=true]:focus-within:ring-destructive/20",
          size === "lg" ? "h-11" : "h-10",
          className,
        )}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-r-none border-r border-input px-3 font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
                size === "lg" ? "h-11 text-base" : "h-10 text-sm",
              )}
              aria-label="Select country dial code"
            >
              <span className="text-base leading-none" role="img" aria-label={selectedCountry.name}>
                {selectedCountry.flag}
              </span>
              <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
              <ChevronDownIcon className="size-3.5 text-muted-foreground/70 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search country or code..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map((country) => {
                    const isSelected = selectedCountry.code === country.code
                    return (
                      <CommandItem
                        key={country.code}
                        value={`${country.name} ${country.dialCode} ${country.code}`}
                        onSelect={() => handleCountrySelect(country)}
                      >
                        <span
                          className="mr-2 text-base leading-none"
                          role="img"
                          aria-label={country.name}
                        >
                          {country.flag}
                        </span>
                        <span className="flex-1 truncate">{country.name}</span>
                        <span className="ml-2 text-xs font-mono text-muted-foreground">
                          {country.dialCode}
                        </span>
                        {isSelected && <CheckIcon className="ml-auto size-4" />}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <input
          ref={ref}
          type="tel"
          disabled={disabled}
          value={currentValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "flex-1 border-0 bg-transparent font-medium shadow-none outline-none",
            "px-3 text-foreground placeholder:font-normal placeholder:text-muted-foreground",
            "disabled:pointer-events-none disabled:placeholder:text-muted-foreground/50",
            size === "lg" ? "text-base" : "text-sm",
          )}
          {...props}
        />
      </div>
    )
  },
)

PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
