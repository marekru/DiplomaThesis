package com.microstepmis.util.math;



/**
* (c) 2005 MicroStep-MIS  www.microstep-mis.com
*
* @author   marekru
* 
* @version  $Id: Interval.java,v 1.6 2014/11/24 11:01:11 marekru Exp $
* 
* Interval
* <from, to>
* Vyzaduje, aby from a to boli Comparable.
* */
public class Interval<D extends Comparable<D>>{
	public D from;
	public D to;
	
	public Interval(D from, D to) {
		this.from = from;
		this.to = to;
	}
	
	public boolean isNull(){
		return from == null || to == null;
	}
	
	/**
	 * isDecreasing()  - klesajuci
	 * !isDecreasing() - nerastuci
	 * @return true, ak interval klesa.
	 * 		   false, ak neplati, ze klesa alebo from alebo to je null
	 * */
	public boolean isDecreasing(){
		if(isNull()){
			return false;
		}
		return (from.compareTo(to) > 0);
	}
	
	/**
	 * isRising() - rastuci
	 * !isRising()- neklesajuci
	 * @return true, ak interval rastie.
	 * 		   false, ak neplati, ze rastie alebo from alebo to je null
	 * */
	public boolean isRising(){
		if(isNull()){
			return false;
		}
		return (from.compareTo(to) < 0);
	}

	/**
	 * 
	 * @param value - skumana hodnota
	 * @return True - hodnota sa nachadza v intervale
	 * 		   False - hodnota sa nachadza mimo intervalu/ alebo value je null
	 * TODO vseobecnejsie aj pre opacny interval (kles/rast)
	 */
	public boolean contains(D value){
		if(value == null){
			return false;
		}
		// je pred alebo za intervalom
		if(before(value) || after(value)){
			return false;
		}
		return true;
	}
	
	/**
	 * 
	 * @param value - skumana hranicna hodnota
	 * @return True - interval sa nachadza pred hranicou
	 * 		   False - interval sa NEnachadza pred hranicou
	 * TODO vseobecnejsie aj pre opacny interval (kles/rast)
	 */
	public boolean before(D value){
		return (to.compareTo(value) < 0);
	}
	
	/**
	 * 
	 * @param value - skumana hranicna hodnota
	 * @return True - interval sa nachadza za hranicou
	 * 		   False - interval sa NEnachadza za hranicou
	 * TODO vseobecnejsie aj pre opacny interval (kles/rast)
	 */
	public boolean after(D value){
		return (from.compareTo(value) > 0);
	}
	

	/**
	 * @param interval - v ktorom by sa mal nachadzat tento interval
	 * @return TRUE, ak je this v intervale. Teda oba body sa nachadzaju v intervale.
	 * TODO vseobecnejsie aj pre opacny interval (kles/rast)
	 */
	public boolean isSubinterval(Interval<D> interval){
		return ( interval.contains(from) && interval.contains(to) );
	}
	
	/**
	 * @param interval - v ktory by mal mat prienik s tymto intervalom
	 * @return TRUE, ak maju spolocny prienik - aspon jeden bod intervalov sa nachadza v tom druhom intervale
	 */
	public boolean hasIntersection(Interval<D> interval){
		return ( interval.contains(from) || interval.contains(to) || contains(interval.from) ||  contains(interval.to) );
	}
	
	/**
	 * 
	 * @param interval - interval s ktorym robime prienik
	 * @return - prienik dvoch intervalov
	 * TODO vseobecnejsie aj pre opacny interval (kles/rast)
	 * TODO ak nie je ziaden prienik !!!
	 */
	public Interval<D> intersection(Interval<D> interval){
		if(!hasIntersection(interval)){
			return null;
		}
		D newFrom = (this.from.compareTo(interval.from) > 0) ? this.from : interval.from; 
		D newTo = (this.to.compareTo(interval.to) < 0) ? this.to : interval.to;
		return new Interval<D>(newFrom, newTo); 
	}
	
	/**
	 * 
	 * @param interval - interval s ktorym robime zjednotenie
	 * @return - zjednotenie dvoch intervalov
	 * TODO vseobecnejsie aj pre opacny interval (kles/rast)
	 */
	public Interval<D> union(Interval<D> interval){
		D newFrom = (this.from.compareTo(interval.from) < 0) ? this.from : interval.from; 
		D newTo = (this.to.compareTo(interval.to) > 0) ? this.to : interval.to;
		return new Interval<D>(newFrom, newTo); 
	}
	
}

