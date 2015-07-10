/*
Displays vaccines administered per month by provider.
To see a different month, modify SelectedMonth and SelectedYear.
*/
select A.EhrProviderId, count(A.ObfuscatedDate) NumVaccinations, (A.SelectedMonth || '-1-' || A.SelectedYear) as Date from
(
select it.EhrProviderId, it.ObfuscatedDate, '1' as SelectedMonth, '2027' as SelectedYear
from ImmType_Deid it
where it.EhrProviderId in (233, 234, 688, 768, 858, 1308, 1376, 1392, 1646, 1679, 1851, 1852, 1853, 1870, 1975, 2072, 2073, 2164)
and extract(month from (it.ObfuscatedDate)) = SelectedMonth
and extract(year from (it.ObfuscatedDate)) = SelectedYear
) A
group by A.EhrProviderId, A.SelectedMonth, A.SelectedYear
order by A.EhrProviderId;
